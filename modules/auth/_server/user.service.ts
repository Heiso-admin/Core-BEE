"use server";

import { sendInvite } from "@heiso/core/app/dashboard/(dashboard)/(permission)/team/_server/team.service";
import { db } from "@heiso/core/lib/db";
import {
  members,
  type TUserUpdate,
  users as usersTable,
} from "@heiso/core/lib/db/schema";
import { hashPassword } from "@heiso/core/lib/hash";
import { generateInviteToken } from "@heiso/core/lib/id-generator";
import { hasAnyUser } from "@heiso/core/server/services/auth";
import { and, eq, sql } from "drizzle-orm";

export async function getUsers() {
  const users = await db.query.users.findMany({
    // where: (table, { isNull }) => isNull(table.deletedAt),
  });
  return users;
}

export async function isUserDeveloper(email: string) {
  const user = await db.query.users.findFirst({
    where: (table, { eq }) => eq(table.email, email),
    with: { developer: true },
  });

  return user?.developer || false;
}

export async function getUserLoginMethod(email: string) {
  const user = await db.query.users.findFirst({
    where: (table, { eq }) => eq(table.email, email),
    columns: { loginMethod: true },
  });

  return user?.loginMethod || null;
}

export async function getLoginMethod(email: string) {
  // 以 member 取得 roleId，然後查詢 role 的 loginMethod
  const membership = await db.query.members.findFirst({
    columns: { roleId: true, isOwner: true },
    where: (t, { and, eq, isNull }) =>
      and(eq(t.email, email), isNull(t.deletedAt)),
  });
  // role: owner
  if (membership?.isOwner) return "both";

  // role: other
  const roleId = membership?.roleId ?? null;
  if (roleId === null) return null;

  const role = await db.query.roles.findFirst({
    where: (t, { eq }) => eq(t.id, roleId),
    columns: { loginMethod: true },
  });

  return role?.loginMethod || null;
}

export async function getMemberStatus(email: string) {
  const member = await db.query.members.findFirst({
    where: (t, { eq, isNull }) => and(eq(t.email, email), isNull(t.deletedAt)),
  });

  if (!member) return null;

  return member.status;
}

// oAuth 已登入且有帳號，更新 user lastLoginAt
export async function updateLastAt(id: string) {
  await db
    .update(usersTable)
    .set({
      lastLoginAt: new Date(),
    })
    .where(eq(usersTable.id, id));
}

export async function getMember(params: { id?: string; email?: string }) {
  const { id, email } = params || {};

  // 若提供 id，先以 userId 查找
  if (id) {
    const byId = await db.query.members.findFirst({
      columns: { userId: true, status: true, email: true },
      where: (t, { and, eq }) => and(eq(t.userId, id)),
    });

    if (byId) {
      await updateLastAt(id);
      return byId;
    }
  }

  // 若提供 email，則以 email 查找
  if (email) {
    const byEmail = await db.query.members.findFirst({
      columns: { userId: true, status: true, email: true },
      where: (t, { and, eq }) => and(eq(t.email, email)),
    });

    if (byEmail) {
      if (byEmail.userId) {
        await updateLastAt(byEmail.userId);
      }
      return byEmail;
    }
  }

  // 若皆未提供或皆未找到，回傳 undefined
  return undefined;
}

export async function getMemberInviteTokenByEmail(email: string) {
  const member = await db.query.members.findFirst({
    columns: { inviteToken: true },
    where: (t, { and, eq }) => and(eq(t.email, email)),
  });
  return member?.inviteToken ?? null;
}

export async function getUser(email: string) {
  const user = await db.query.users.findFirst({
    with: {
      developer: true,
    },
    where: (table, { eq }) => eq(table.email, email),
  });
  return user;
}

// export async function update(id: string, data: TUserUpdate) {
export async function update(id: string, data: TUserUpdate) {
  const result = await db
    .update(usersTable)
    .set(data)
    .where(eq(usersTable.id, id));
  return result;
}

export async function changePassword(id: string, password: string) {
  const hashedPassword = await hashPassword(password);
  await db
    .update(usersTable)
    .set({
      password: hashedPassword,
      mustChangePassword: false,
    })
    .where(eq(usersTable.id, id));
}

/**
 * Resend invite email to a owner, but owner invite in team.service.
 */
export async function resendInviteByEmail(email: string) {
  const member = await db.query.members.findFirst({
    where: (t, { eq, isNull }) => and(eq(t.email, email), isNull(t.deletedAt)),
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
    .where(eq(members.id, member.id))
    .returning();

  const result = await sendInvite({
    email: member.email,
    inviteToken,
    isOwner: member.isOwner,
  });

  return result;
}

/**
 * Ensure a member has a valid invite token without sending email.
 * - If member does not exist, create one with token and expiry.
 * - If member exists but token missing/expired, refresh the token.
 * - Returns the invite token.
 */
export async function ensureInviteTokenSilently(email: string, tx?: any, tenantId?: string) {
  const d = tx || db;

  // Resolve tenantId if not provided (fallback to RLS context context query, but explicit is better)
  if (!tenantId) {
    const tenantIdResult = await d.execute(sql`SELECT current_setting('app.current_tenant_id', true) as tenant_id`);
    tenantId = tenantIdResult[0]?.tenant_id as string;
  }

  if (!tenantId) {
    console.error("[DEBUG] Tenant context missing in ensureInviteTokenSilently!");
    throw new Error("Tenant context missing during member creation");
  }

  // Explicitly filter by tenantId (critical for Superuser which ignores RLS)
  const member = await d.query.members.findFirst({
    where: (t: any, { and, eq, isNull }: any) =>
      and(
        eq(t.email, email),
        isNull(t.deletedAt),
        eq(t.tenantId, tenantId)
      ),
  });

  const now = Date.now();
  const needsNewToken =
    !member?.inviteToken ||
    !member?.tokenExpiredAt ||
    member.tokenExpiredAt.getTime() < now;

  if (!member) {
    const inviteToken = generateInviteToken();
    const inviteTokenExpiresAt = new Date(now + 1000 * 60 * 60 * 24 * 7); // 7 days

    // Check if this is the first member of the tenant (Explicit filter)
    const existingMember = await d.query.members.findFirst({
      columns: { id: true },
      where: (t: any, { eq, isNull }: any) =>
        and(eq(t.tenantId, tenantId), isNull(t.deletedAt)),
    });
    const isOwner = !existingMember;

    console.log("[DEBUG] ensureInviteTokenSilently: Current Tenant:", tenantId);
    console.log("[DEBUG] Attempting to insert member with tenantId:", tenantId, "isOwner:", isOwner);

    const [created] = await d
      .insert(members)
      .values({
        tenantId,
        isOwner,
        email,
        inviteToken,
        tokenExpiredAt: inviteTokenExpiresAt,
      })
      .returning({ inviteToken: members.inviteToken });
    return created?.inviteToken ?? null;
  }

  if (needsNewToken) {
    const inviteToken = generateInviteToken();
    const inviteTokenExpiresAt = new Date(now + 1000 * 60 * 60 * 24 * 7);
    const [updated] = await d
      .update(members)
      .set({
        inviteToken,
        tokenExpiredAt: inviteTokenExpiresAt,
        status: "invited",
      })
      .where(eq(members.id, member.id))
      .returning({ inviteToken: members.inviteToken });
    return updated?.inviteToken ?? null;
  }

  return member.inviteToken;
}

/**
 * 首次登入：確保建立/刷新 member 並將狀態設為 review，綁定 userId。
 * - 行為仿照 team invite 的儲存（生成/刷新 inviteToken 與到期時間）但不寄信
 */
export async function ensureMemberReviewOnFirstLogin(
  email: string,
  userId?: string,
  tenantId?: string,
) {
  return await db.transaction(async (tx) => {
    console.log("[DEBUG] ensureMemberReviewOnFirstLogin: Transaction started. TenantId:", tenantId);

    // 1. Set RLS Context inside Transaction
    if (tenantId) {
      await tx.execute(
        sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`,
      );
      console.log("[DEBUG] RLS Context Set for tenant:", tenantId);
    } else {
      console.warn("[DEBUG] No tenantId provided to ensureMemberReviewOnFirstLogin!");
    }

    // 2. Ensure Token (Pass tx, tenantId)
    const token = await ensureInviteTokenSilently(email, tx, tenantId);
    console.log("[DEBUG] ensureInviteTokenSilently result:", token);

    // Check if tenant has any owner (Explicit Filter)
    const existingOwner = await tx.query.members.findFirst({
      where: (t, { and, eq, isNull }) =>
        and(
          eq(t.isOwner, true),
          isNull(t.deletedAt),
          eq(t.tenantId, tenantId!) // Explicitly filter by tenantId
        ),
      columns: { id: true },
    });

    const shouldBeOwner = !existingOwner;

    // 3. Update Status (Use tx, explicit filter)
    const member = await tx.query.members.findFirst({
      where: (t, { and, eq, isNull }) =>
        and(
          eq(t.email, email),
          isNull(t.deletedAt),
          eq(t.tenantId, tenantId!) // Explicitly filter
        ),
    });

    if (!member) return null;

    const [updated] = await tx
      .update(members)
      .set({
        userId: member.userId ?? userId,
        status: "joined",
        isOwner: member.isOwner || shouldBeOwner,
        updatedAt: new Date(),
      })
      .where(eq(members.id, member.id))
      .returning({
        userId: members.userId,
        status: members.status,
        email: members.email,
        isOwner: members.isOwner,
      });

    return updated ?? null;
  });
}

/**
 * Check if the current tenant has any owner.
 * Used for detecting initial tenant state.
 */
export async function checkTenantHasOwner(tenantId?: string) {
  if (!tenantId) {
    // If no tenantId explicitly passed, try to get it from current setting (unlikely to work in detached server action without context)
    const tenantIdResult = await db.execute(sql`SELECT current_setting('app.current_tenant_id', true) as tenant_id`);
    tenantId = tenantIdResult[0]?.tenant_id as string;
  }

  if (!tenantId) return false;

  const result = await db.transaction(async (tx) => {
    // Set RLS context for this check
    await tx.execute(
      sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`,
    );

    const owner = await tx.query.members.findFirst({
      where: (t, { and, eq, isNull }) =>
        and(
          eq(t.isOwner, true),
          isNull(t.deletedAt),
          eq(t.tenantId, tenantId!) // Explicitly filter
        ),
      columns: { id: true, tenantId: true },
    });
    return !!owner;
  });

  return result;
}

// export async function findRoles(userId: string) {
//   const result = await db
//     .select({
//       id: roles.id,
//       name: roles.name,
//     })
//     .from(userRoles)
//     .innerJoin(roles, eq(userRoles.roleId, roles.id))
//     .where(eq(userRoles.userId, userId));

//   return result;
// }

// export async function getCustomPermissions(userId: string) {
//   const result = await db
//     .select({
//       resource: permissions.resource,
//       action: permissions.action,
//     })
//     .from(userPermissions)
//     .innerJoin(permissions, eq(userPermissions.permissionId, permissions.id))
//     .where(eq(userPermissions.userId, userId));

//   return result;
// }
