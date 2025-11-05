"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  members,
  type TUserUpdate,
  userPasswordReset,
  users as usersTable,
} from "@/lib/db/schema";
import { hashPassword } from "@/lib/hash";
import { generateInviteToken } from "@/lib/id-generator";
import { sendInvite } from "@/app/dashboard/(dashboard)/(permission)/team/_server/team.service";

export async function getUsers() {
  const users = await db.query.users.findMany({
    // where: (table, { isNull }) => isNull(table.deletedAt),
  });
  return users;
}

export async function getLoginMethod(email: string) {
  const result = await db.query.users.findFirst({
    where: (table, { eq }) => eq(table.email, email),
    columns: {
      loginMethod: true,
    },
  });

  if (!result) return null;

  return result?.loginMethod ?? 'both';
}

export async function getMemberStatus(email: string) {
  const member = await db.query.members.findFirst({
    where: (t, { eq, isNull }) => and(eq(t.email, email), isNull(t.deletedAt)),
  });

  if (!member) return null;

  return member.status;
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
