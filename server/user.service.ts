"use server";

import { getDynamicDb } from "@heiso/core/lib/db/dynamic";
import {
  type TUserUpdate,
  users as usersTable,
} from "@heiso/core/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getUsers() {
  const db = await getDynamicDb();
  const users = await db.query.users.findMany({
    // where: (table, { isNull }) => isNull(table.deletedAt),
  });
  return users;
}

export async function getUserById(id: string) {
  const db = await getDynamicDb();
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
  const db = await getDynamicDb();
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
  const db = await getDynamicDb();
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

export async function getAccountByEmail(email: string) {
  const db = await getDynamicDb();
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
    where: (table, { eq }) => eq(table.email, email),
  });
  return account;
}

export async function getUser(email: string) {
  const db = await getDynamicDb();
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
  const db = await getDynamicDb();
  const result = await db
    .update(usersTable)
    .set(data)
    .where(eq(usersTable.id, id));
  return result;
}
