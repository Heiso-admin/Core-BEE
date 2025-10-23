"use server";

import { and, eq, gt } from "drizzle-orm";
import { db } from "@/lib/db";
// import {
//   userRoles,
//   roles,
//   userPermissions,
//   permissions,
// } from '@/lib/db/schema';
import {
  type TUserUpdate,
  userPasswordReset,
  users as usersTable,
} from "@/lib/db/schema";
import { hashPassword } from "@/lib/hash";

export async function getUsers() {
  const users = await db.query.users.findMany({
    // where: (table, { isNull }) => isNull(table.deletedAt),
  });
  return users;
}

export async function getUser(email: string) {
  const user = await db.query.users.findFirst({
    with: {
      administrator: true,
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
