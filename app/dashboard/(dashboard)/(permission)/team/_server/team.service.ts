"use server";

import { and, eq, isNull, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { auth } from "@/modules/auth/auth.config";
import { settings } from "@/config/settings";
import config from "@/config";
import { getSiteSettings } from "@/server/services/system/setting";
import { db } from "@/lib/db";
import type { TMember, TRole, TUser } from "@/lib/db/schema";
import { members, roles } from "@/lib/db/schema";
import { users } from "@/lib/db/schema/auth/user";
import { sendEmail, sendInviteUserEmail } from "@/lib/email";
import { hashPassword } from "@/lib/hash";
import { generateInviteToken } from "@/lib/id-generator";

export type Member = TMember & {
  user: TUser | null;
  role: TRole | null;
};
async function getTeamMembers(): Promise<Member[]> {
  const members = await db.query.members.findMany({
    with: {
      user: true,
      role: true,
    },
    where: (t, { isNull }) => isNull(t.deletedAt),
    orderBy: (t, { asc }) => [asc(t.createdAt)],
  });
  return members;
}

async function invite({
  email,
  role,
}: {
  email: string;
  role?: string;
}) {
  // 檢查是否已存在相同 email 的成員
  const existingMember = await db
    .select()
    .from(members)
    .where(eq(members.email, email))
    .limit(1);

  if (existingMember.length > 0) {
    throw new Error("EMAIL_REPEAT");
  }

  const inviteToken = generateInviteToken();
  const inviteTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  const inviteId = await db
    .insert(members)
    .values({
      roleId: role !== "owner" ? role : null,
      isOwner: role === "owner",
      email,
      inviteToken,
      tokenExpiredAt: inviteTokenExpiresAt,
    })
    .returning();

  if (inviteId) {
    const result = await sendInvite({
      email,
      inviteToken,
      isOwner: role === "owner",
    });

    revalidatePath("./team", "page");
  }

  return inviteId;
}

async function updateMember({
  id,
  data,
}: {
  id: string;
  data: {
    isOwner?: boolean;
    roleId?: string | null;
    status?: string;
  };
}) {
  // Prepare member updates, including deletedAt based on status
  const isJoined = data.status === 'joined';

  const memberUpdates: Partial<typeof members.$inferInsert> = {
    ...data,
    updatedAt: new Date(),
  };

  const member = await db.update(members).set(memberUpdates).where(eq(members.id, id));

  // user table，除了 joined，其他狀態都皆不可登入
  const [current] = await db.select().from(members).where(eq(members.id, id)).limit(1);
  const userId = current?.userId;
  if (userId) {
    await db
      .update(users)
      .set({ active: isJoined })
      .where(eq(users.id, userId));
  }

  revalidatePath("./team", "page");
  return member;
}

async function sendInvite({
  email,
  inviteToken,
  isOwner
}: {
  email: string;
  inviteToken: string;
  isOwner: boolean;
}) {
  const { NOTIFY_EMAIL } = await settings();
  const result = await sendInviteUserEmail({
    from: NOTIFY_EMAIL as string,
    to: [email],
    inviteToken,
    owner: isOwner,
  });
  return result;
}

async function resendInvite(id: string) {
  const member = await db.query.members.findFirst({
    where: (t, { eq }) => and(eq(t.id, id), isNull(t.deletedAt)),
  });

  if (!member) {
    throw new Error("Member not found");
  }

  const inviteToken = generateInviteToken();
  const inviteTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  await db
    .update(members)
    .set({
      inviteToken,
      tokenExpiredAt: inviteTokenExpiresAt,
    })
    .where(eq(members.id, id))
    .returning();

  const { email } = member;
  const result = await sendInvite({
    email,
    inviteToken,
    isOwner: member.isOwner,
  });

  return result;
}

async function revokeInvite(id: string) {
  await db.delete(members).where(eq(members.id, id));
  // await db
  //   .update(members)
  //   .set({
  //     deletedAt: new Date(),
  //   })
  //   .where(eq(members.id, id));
}

async function leaveTeam(id: string) {
  await db.delete(members).where(eq(members.id, id));

  // await db
  //   .update(members)
  //   .set({
  //     deletedAt: new Date(),
  //   })
  //   .where(eq(members.id, id));
  revalidatePath("./team", "page");
}


async function addMember({
  email,
  roleId,
  initialPassword,
}: {
  email: string;
  roleId: string;
  initialPassword: string;
}) {
  // Check if email already exists in users or members table
  const existingUser = await db.query.users.findFirst({
    where: (t, { eq }) => eq(t.email, email),
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const existingMember = await db.query.members.findFirst({
    where: (t, { eq, isNull }) => and(eq(t.email, email), isNull(t.deletedAt)),
  });

  if (existingMember) {
    throw new Error("Email already exists in team");
  }

  const hashedPassword = await hashPassword(initialPassword);

  // Create user first
  const [user] = await db
    .insert(users)
    .values({
      email,
      password: hashedPassword,
      name: email.split("@")[0], // Use email prefix as default name
      mustChangePassword: true, // Force password change on first login
    })
    .returning();

  // Create member record
  const [member] = await db
    .insert(members)
    .values({
      userId: user.id,
      roleId,
      isOwner: false,
      status: "joined",
      email,
    })
    .returning();

  revalidatePath("./team", "page");
  return { user, member };
}

async function transferOwnership({
  newOwnerId,
  currentOwnerId,
}: {
  newOwnerId: string;
  currentOwnerId: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // 查找當前擁有者
  const currentOwnerMember = await db.query.members.findFirst({
    where: and(
      eq(members.id, currentOwnerId),
      eq(members.userId, session.user.id),
      eq(members.isOwner, true)
    ),
  });

  if (!currentOwnerMember) {
    throw new Error("Only current owner can transfer ownership");
  }

  // 查找新擁有者
  const newOwnerMember = await db.query.members.findFirst({
    where: and(
      eq(members.id, newOwnerId),
      eq(members.status, "joined")
    ),
  });

  if (!newOwnerMember) {
    throw new Error("Target member must be joined and active");
  }

  // 查找預設角色
  const defaultRole = await db.query.roles.findFirst({
    where: isNull(roles.deletedAt),
    orderBy: [asc(roles.createdAt)],
  });

  if (!defaultRole) {
    throw new Error("No available role found for former owner");
  }

  await db.transaction(async (tx) => {
    // 設定新擁有者
    await tx
      .update(members)
      .set({
        isOwner: true,
        roleId: null,
      })
      .where(eq(members.id, newOwnerId));

    // 設定前擁有者角色
    await tx
      .update(members)
      .set({
        isOwner: false,
        roleId: null, //移除權限
      })
      .where(eq(members.id, currentOwnerId));
  });

  revalidatePath("/dashboard/team");

  return { success: true };
}

async function resetMemberPassword({
  actorMemberId,
  targetMemberId,
  newPassword,
}: {
  actorMemberId: string;
  targetMemberId: string;
  newPassword: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }

  // 以成員ID驗證操作者身份與權限
  const actor = await db
    .select()
    .from(members)
    .where(eq(members.id, actorMemberId))
    .limit(1);

  if (!actor[0]) {
    return { success: false, error: "ACTOR_MEMBER_NOT_FOUND" };
  }
  if (actor[0].userId !== session.user.id) {
    return { success: false, error: "UNAUTHORIZED" };
  }
  if (!actor[0].isOwner) {
    return { success: false, error: "PERMISSION_DENIED" };
  }

  // 重設密碼的成員
  const target = await db
    .select()
    .from(members)
    .where(eq(members.id, targetMemberId))
    .limit(1);

  if (!target[0]) {
    return { success: false, error: "MEMBER_NOT_FOUND" };
  }
  if (!target[0].userId) {
    return { success: false, error: "USER_NOT_ACTIVATED" };
  }

  const hashedPassword = await hashPassword(newPassword);

  await db
    .update(users)
    .set({ password: hashedPassword, mustChangePassword: true })
    .where(eq(users.id, target[0].userId));
  return { success: true };
}

export {
  getTeamMembers,
  invite,
  updateMember,
  sendInvite,
  resendInvite,
  revokeInvite,
  leaveTeam,
  addMember,
  transferOwnership,
  resetMemberPassword,
};
