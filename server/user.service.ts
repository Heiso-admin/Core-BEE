"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { type TUserUpdate, users as usersTable } from "@/lib/db/schema";

export async function getUsers() {
  const users = await db.query.users.findMany({
    // where: (table, { isNull }) => isNull(table.deletedAt),
  });
  return users;
}

export async function getUserById(id: string) {
  const user = await db.query.users.findFirst({
    columns: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      active: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
    with: {
      developer: true,
      membership: true,
    },
    where: (table, { and, eq }) => and(eq(table.id, id)),
  });
  return user;
}

export async function getInvitation(token: string) {
  const invitation = await db.query.members.findFirst({
    columns: {
      id: true,
      email: true,
    },
    where: (table, { and, eq }) => and(eq(table.inviteToken, token)),
  });

  if (!invitation)
    return {
      invitation: null,
      user: null,
    };

  const user = await db.query.users.findFirst({
    columns: {
      id: true,
      email: true,
    },
    where: (table, { eq }) => eq(table.email, invitation.email),
  });

  return {
    invitation,
    user,
  };
}

export async function getAccount(id: string) {
  const account = await db.query.users.findFirst({
    columns: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      active: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
    with: {
      developer: true,
      membership: {
        columns: {
          id: true,
          isOwner: true,
        },
        with: {
          role: {
            columns: {
              id: true,
              name: true,
              fullAccess: true,
            },
          },
        },
      },
    },
    where: (table, { and, eq }) => and(eq(table.id, id)),
  });
  return account;
}

export async function getUser(email: string) {
  const user = await db.query.users.findFirst({
    columns: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      active: true,
      lastLoginAt: true,
      createdAt: true,
      updatedAt: true,
    },
    where: (table, { eq }) => eq(table.email, email),
  });
  return user;
}

export async function update(id: string, data: TUserUpdate) {
  const result = await db
    .update(usersTable)
    .set(data)
    .where(eq(usersTable.id, id));
  return result;
}
