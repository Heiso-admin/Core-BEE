"use server";

import { settings } from "@heiso/core/config/settings";
import { getDynamicDb } from "@heiso/core/lib/db/dynamic";
import type { TMember, TRole, TUser } from "@heiso/core/lib/db/schema";
import { members, roles } from "@heiso/core/lib/db/schema";
import { users } from "@heiso/core/lib/db/schema/auth/user";
import { sendApprovedEmail, sendInviteUserEmail } from "@heiso/core/lib/email";
import { hashPassword } from "@heiso/core/lib/hash";
import { generateInviteToken } from "@heiso/core/lib/id-generator";
import { auth } from "@heiso/core/modules/auth/auth.config";
import { and, asc, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { headers } from "next/headers";

export type Member = TMember & {
  user: TUser | null;
  role: TRole | null;
};
async function getTeamMembers(): Promise<Member[]> {
  const db = await getDynamicDb();
  const h = await headers();
  const tenantId = h.get("x-tenant-id");

  const members = await db.query.members.findMany({
    with: {
      user: true,
      role: true,
    },
    where: (t, { isNull, and, eq }) => {
      const filters = [isNull(t.deletedAt)];
      if (tenantId) filters.push(eq(t.tenantId, tenantId));
      return and(...filters);
    },
    orderBy: (t, { asc }) => [asc(t.createdAt)],
  });
  return members;
}

async function invite({
  email,
  role,
  name,
}: {
  email: string;
  role?: string;
  name?: string;
}) {
  const db = await getDynamicDb();
  const h = await headers();
  const tenantId = h.get("x-tenant-id");
  if (!tenantId) throw new Error("Tenant context missing");

  // 檢查是否已存在相同 email 的成員
  const existingMember = await db
    .select()
    .from(members)
    .where(and(eq(members.email, email), eq(members.tenantId, tenantId)))
    .limit(1);

  if (existingMember.length > 0) {
    throw new Error("EMAIL_REPEAT");
  }

  // 若提供 name，先建立或更新 user 資料
  let boundUserId: string | undefined;
  if (name?.trim()) {
    const existingUser = await db.query.users.findFirst({
      where: (t, { eq }) => eq(t.email, email),
    });

    if (existingUser) {
      // 輸入使用者名稱（不影響密碼與登入狀態）
      await db
        .update(users)
        .set({ name, updatedAt: new Date() })
        .where(eq(users.id, existingUser.id));
      boundUserId = existingUser.id;
    } else {
      // 建立使用者占位密碼，避免與註冊流程衝突
      const placeholder = await hashPassword(generateInviteToken());
      const [created] = await db
        .insert(users)
        .values({
          email,
          name,
          password: placeholder,
          active: false,
          mustChangePassword: true,
          updatedAt: new Date(),
        })
        .returning();
      boundUserId = created?.id;
    }
  }

  const inviteToken = generateInviteToken();
  const inviteTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  const inviteId = await db
    .insert(members)
    .values({
      roleId: role !== "owner" ? role : null,
      isOwner: role === "owner",
      email,
      userId: boundUserId ?? undefined,
      inviteToken,
      tokenExpiredAt: inviteTokenExpiresAt,
      tenantId,
    })
    .returning();

  if (inviteId) {
    const _result = await sendInvite({
      email,
      inviteToken,
      isOwner: role === "owner",
    });

    revalidatePath("/dashboard/permission/team", "page");
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
  const db = await getDynamicDb();
  // Prepare member updates, including deletedAt based on status
  const isJoined = data.status === "joined";

  const h = await headers();
  const tenantId = h.get("x-tenant-id");
  // Note: For updates, rely on ID but filtering by tenantId is safer
  const filters = [eq(members.id, id)];
  if (tenantId) filters.push(eq(members.tenantId, tenantId));

  const memberUpdates: Partial<typeof members.$inferInsert> = {
    ...data,
    updatedAt: new Date(),
  };

  const member = await db
    .update(members)
    .set(memberUpdates)
    .where(and(...filters));

  // user table，除了 joined，其他狀態都皆不可登入
  const [current] = await db
    .select()
    .from(members)
    .where(and(...filters))
    .limit(1);
  const userId = current?.userId;
  if (userId) {
    await db
      .update(users)
      .set({ active: isJoined })
      .where(eq(users.id, userId));
  }

  revalidatePath("/dashboard/permission/team", "page");
  return member;
}

async function sendInvite({
  email,
  inviteToken,
  isOwner,
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

async function sendApproved({ email }: { email: string }) {
  const { NOTIFY_EMAIL } = await settings();
  const result = await sendApprovedEmail({
    from: NOTIFY_EMAIL as string,
    to: [email],
  });
  return result;
}

async function resendInvite(id: string) {
  const db = await getDynamicDb();
  const h = await headers();
  const tenantId = h.get("x-tenant-id");

  const member = await db.query.members.findFirst({
    where: (t, { eq, and }) => {
      const filters = [eq(t.id, id), isNull(t.deletedAt)];
      if (tenantId) filters.push(eq(t.tenantId, tenantId));
      return and(...filters);
    },
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
    .where(eq(members.id, id)) // Should filter by tenantId too but id is unique UUID
    .returning();

  const { email } = member;
  const result = await sendInvite({
    email,
    inviteToken,
    isOwner: member.isOwner,
  });

  revalidatePath("/dashboard/permission/team", "page");
  return result;
}

async function revokeInvite(id: string) {
  const db = await getDynamicDb();
  const h = await headers();
  const tenantId = h.get("x-tenant-id");
  const filters = [eq(members.id, id)];
  if (tenantId) filters.push(eq(members.tenantId, tenantId));

  await db.delete(members).where(and(...filters));
}

async function leaveTeam(id: string) {
  const db = await getDynamicDb();
  const h = await headers();
  const tenantId = h.get("x-tenant-id");
  const filters = [eq(members.id, id)];
  if (tenantId) filters.push(eq(members.tenantId, tenantId));

  // 刪除成員並取得其 userId
  const [deletedMember] = await db
    .delete(members)
    .where(and(...filters))
    .returning({ userId: members.userId });

  // 若有綁定使用者，連同 users 一併刪除
  const userId = deletedMember?.userId;
  if (userId) {
    await db.delete(users).where(eq(users.id, userId));
  }

  revalidatePath("/dashboard/permission/team", "page");
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
  const db = await getDynamicDb();
  const h = await headers();
  const tenantId = h.get("x-tenant-id");
  if (!tenantId) throw new Error("Tenant context missing");

  // Check if email already exists in users
  const existingUser = await db.query.users.findFirst({
    where: (t, { eq }) => eq(t.email, email),
  });

  // Check if member already exists in THIS tenant
  const existingMember = await db.query.members.findFirst({
    where: (t, { eq, isNull, and }) => and(eq(t.email, email), isNull(t.deletedAt), eq(t.tenantId, tenantId)),
  });

  if (existingMember) {
    throw new Error("Email already exists in team");
  }

  let userId = existingUser?.id;
  let user = existingUser;

  // If user does not exist, create it
  if (!existingUser) {
    const hashedPassword = await hashPassword(initialPassword);
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        name: email.split("@")[0], // Use email prefix as default name
        mustChangePassword: true, // Force password change on first login
      })
      .returning();
    userId = newUser.id;
    user = newUser;
  }

  // Create member record (linking to userId)
  const [member] = await db
    .insert(members)
    .values({
      userId: userId!,
      roleId,
      isOwner: false,
      status: "joined",
      email,
      tenantId,
    })
    .returning();

  revalidatePath("/dashboard/permission/team", "page");
  return { user, member };
}

async function transferOwnership({
  newOwnerId,
  currentOwnerId,
}: {
  newOwnerId: string;
  currentOwnerId: string;
}) {
  const db = await getDynamicDb();
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  const h = await headers();
  const tenantId = h.get("x-tenant-id");

  // 查找當前擁有者
  const currentOwnerMember = await db.query.members.findFirst({
    where: (t, { eq, and }) => {
      const filters = [
        eq(t.id, currentOwnerId),
        eq(t.userId, session.user.id!),
        eq(t.isOwner, true),
      ];
      if (tenantId) filters.push(eq(t.tenantId, tenantId));
      return and(...filters);
    },
  });

  if (!currentOwnerMember) {
    throw new Error("Only current owner can transfer ownership");
  }

  // 查找新擁有者
  const newOwnerMember = await db.query.members.findFirst({
    where: (t, { eq, and }) => {
      const filters = [eq(t.id, newOwnerId), eq(t.status, "joined")];
      if (tenantId) filters.push(eq(t.tenantId, tenantId));
      return and(...filters);
    },
  });

  if (!newOwnerMember) {
    throw new Error("Target member must be joined and active");
  }

  // 查找預設角色
  const defaultRole = await db.query.roles.findFirst({
    where: (t, { isNull, and, eq }) => {
      const filters = [isNull(t.deletedAt)];
      if (tenantId) filters.push(eq(t.tenantId, tenantId));
      return and(...filters);
    },
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
  const db = await getDynamicDb();
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  const h = await headers();
  const tenantId = h.get("x-tenant-id");

  const actorFilters = [eq(members.id, actorMemberId)];
  if (tenantId) actorFilters.push(eq(members.tenantId, tenantId));

  // 以成員ID驗證操作者身份與權限
  const actor = await db
    .select()
    .from(members)
    .where(and(...actorFilters))
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

  const targetFilters = [eq(members.id, targetMemberId)];
  if (tenantId) targetFilters.push(eq(members.tenantId, tenantId));

  // 重設密碼的成員
  const target = await db
    .select()
    .from(members)
    .where(and(...targetFilters))
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
  sendApproved,
  sendInvite,
  resendInvite,
  revokeInvite,
  leaveTeam,
  addMember,
  transferOwnership,
  resetMemberPassword,
};
