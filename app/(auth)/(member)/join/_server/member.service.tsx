"use server";

import { getDynamicDb } from "@heiso/core/lib/db/dynamic";
import { members } from "@heiso/core/lib/db/schema";
import { users } from "@heiso/core/lib/db/schema/auth/user";
import { auth } from "@heiso/core/modules/auth/auth.config";
import { and, eq, isNull } from "drizzle-orm";
import { cookies } from "next/headers";

async function getMembership() {
  const db = await getDynamicDb();
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Check if user is developer first
  const isDeveloper = await db.query.developers
    .findFirst({
      where: (t, { eq }) => eq(t.userId, userId),
    })
    .then(Boolean);

  // If user is developer, no need to query membership
  if (isDeveloper) {
    return { isDeveloper, membership: null };
  }

  // Get member details if not developer
  const membership = await db.query.members.findFirst({
    columns: {
      id: true,
      isOwner: true,
    },
    with: {
      role: {
        columns: {
          id: true,
          fullAccess: true,
        },
      },
    },
    where: (t, { eq }) => and(eq(t.userId, userId), eq(t.status, "joined")),
  });

  return { isDeveloper, membership };
}

async function getInviteToken({ token }: { token: string }) {
  const db = await getDynamicDb();
  const member = await db.query.members.findFirst({
    where: (t, { eq }) => and(eq(t.inviteToken, token), isNull(t.deletedAt)),
    with: {
      user: {
        columns: { id: true, name: true, avatar: true },
      },
    },
  });

  if (!member) return null;

  if (!member.tokenExpiredAt || member.tokenExpiredAt < new Date()) {
    return null;
  }

  return member;
}

async function join(userId: string) {
  const db = await getDynamicDb();
  const result = await db
    .update(members)
    .set({
      id: userId,
      inviteToken: "",
      tokenExpiredAt: null,
      status: "joined",
      updatedAt: new Date(),
    })
    .where(and(eq(members.id, userId), isNull(members.deletedAt)));

  return result;
}

async function decline(id: string) {
  const db = await getDynamicDb();
  return await db
    .update(members)
    .set({
      inviteToken: "",
      tokenExpiredAt: null,
      status: "declined",
    })
    .where(eq(members.id, id));
}

async function removeJoinToken() {
  const cookieStore = await cookies();
  cookieStore.delete("join-token");
}

export { getMembership, getInviteToken, join, decline, removeJoinToken };

// 更新使用者基本資料（名稱、Email、頭像）並同步 members.email
export async function updateBasicProfile({
  userId,
  name,
  email,
  avatar,
  password,
}: {
  userId: string;
  name?: string;
  email?: string;
  avatar?: string | null;
  password?: string;
}) {
  const db = await getDynamicDb();
  const session = await auth();
  if (!session?.user?.id || session.user.id !== userId) {
    throw new Error("Unauthorized");
  }

  const updates: Partial<{
    name: string;
    email: string;
    avatar?: string | null;
    password: string;
    updatedAt: Date;
  }> = {
    updatedAt: new Date(),
  };
  if (typeof name === "string" && name.trim()) updates.name = name.trim();
  if (typeof email === "string" && email.trim()) updates.email = email.trim();
  if (typeof avatar === "string") updates.avatar = avatar;

  // 若提供密碼，進行雜湊後更新（未提供則不更新密碼）
  if (typeof password === "string" && password.trim().length > 0) {
    const { hashPassword } = await import("@heiso/core/lib/hash");
    updates.password = await hashPassword(password.trim());
  }

  // 更新 users
  if (Object.keys(updates).length > 0) {
    await db.update(users).set(updates).where(eq(users.id, userId));
  }

  // 同步 members.email（若提供 email）
  if (typeof email === "string" && email.trim()) {
    await db
      .update(members)
      .set({ email: email.trim(), updatedAt: new Date() })
      .where(and(eq(members.userId, userId), isNull(members.deletedAt)));
  }

  return { ok: true };
}
