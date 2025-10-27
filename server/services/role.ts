"use server";

import { db } from "@/lib/db";

interface UserPermission {
  role: string;
  fullAccess: boolean;
  permissions?: {
    id: string;
    resource: string;
    action: string;
  }[];
}

async function findUserPermissions(userId: string): Promise<UserPermission> {
  const user = await db.query.users.findFirst({
    with: {
      developer: true,
    },
    where: (t, { eq }) => eq(t.id, userId),
  });

  if (!user) throw new Error('User not found');

  const isDeveloper = user?.developer?.userId === userId;
  const membership = await db.query.members.findFirst({
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
        with: {
          permissions: {
            with: {
              permission: {
                columns: {
                  id: true,
                  resource: true,
                  action: true,
                },
              },
            },
          },
        },
      },
    },
    where: (t, { eq, and, isNull }) =>
      and(eq(t.userId, userId), isNull(t.deletedAt)),
  });

  let role = '';
  if (isDeveloper === true) {
    role = 'develop';
  } else if (membership?.isOwner === true) {
    role = 'owner';
  } else {
    role = membership?.role?.name ?? '';
  }

  const fullAccess =
    isDeveloper === true ||
    membership?.isOwner === true ||
    membership?.role?.fullAccess === true;

  return {
    role,
    fullAccess,
    permissions: membership?.role?.permissions.map((e) => e.permission) ?? [],
  };
}

export { findUserPermissions, type UserPermission };
