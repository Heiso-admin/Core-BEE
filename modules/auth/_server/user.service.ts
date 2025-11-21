'use server';

import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import {
  members,
  type TUserUpdate,
  users as usersTable,
} from '@/lib/db/schema';
import { hashPassword } from '@/lib/hash';
import { generateInviteToken } from '@/lib/id-generator';
import { sendInvite } from '@/app/dashboard/(dashboard)/(permission)/team/_server/team.service';
import { hasAnyUser } from '@/server/services/auth';

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
  if (membership?.isOwner) return 'both';

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
    throw new Error('Member not found');
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
export async function ensureInviteTokenSilently(email: string) {
  const member = await db.query.members.findFirst({
    where: (t, { eq, isNull }) => and(eq(t.email, email), isNull(t.deletedAt)),
  });

  const now = Date.now();
  const needsNewToken =
    !member?.inviteToken ||
    !member?.tokenExpiredAt ||
    member.tokenExpiredAt.getTime() < now;

  if (!member) {
    const inviteToken = generateInviteToken();
    const inviteTokenExpiresAt = new Date(now + 1000 * 60 * 60 * 24 * 7); // 7 days

    const isOwner = !(await hasAnyUser());
    const [created] = await db
      .insert(members)
      .values({
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
    const [updated] = await db
      .update(members)
      .set({
        inviteToken,
        tokenExpiredAt: inviteTokenExpiresAt,
        status: 'review',
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
  userId?: string
) {
  // 嘗試建立/刷新 invite token（若無 token 也不阻擋狀態更新）
  await ensureInviteTokenSilently(email);

  const member = await db.query.members.findFirst({
    where: (t, { and, eq, isNull }) =>
      and(eq(t.email, email), isNull(t.deletedAt)),
  });

  if (!member) return null;

  const result = await db
    .update(members)
    .set({
      userId: member.userId ?? undefined,
      status: 'review',
      updatedAt: new Date(),
    })
    .where(eq(members.id, member.id))
    .returning({
      userId: members.userId,
      status: members.status,
      email: members.email,
    });

  return result ?? null;
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
