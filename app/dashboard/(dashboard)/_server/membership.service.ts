"use server";

import { auth } from '@/modules/auth/auth.config';
import { db } from "@/lib/db";
import type { TMenu, TPermission } from "@/lib/db/schema";

// Types
type AccessParams = {
  fullAccess: boolean;
  roleId?: string | null;
};

// Error messages
const UNAUTHORIZED_ERROR = "Unauthorized";

async function getUser() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error(UNAUTHORIZED_ERROR);

  const user = await db.query.users.findFirst({
    columns: { id: true, mustChangePassword: true },
    where: (t, { eq }) => eq(t.id, userId),
  });

  return user;
}

async function getMyMembership() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error(UNAUTHORIZED_ERROR);

  const [user, membership] = await Promise.all([
    db.query.users.findFirst({
      columns: { id: true },
      with: { developer: true },
      where: (t, { eq }) => eq(t.id, userId),
    }),
    db.query.members.findFirst({
      columns: {
        id: true,
        roleId: true,
        isOwner: true,
        status: true,
      },
      with: {
        role: {
          columns: {
            id: true,
            fullAccess: true,
          },
        },
      },
      where: (t, { and, eq, isNull }) =>
        and(eq(t.userId, userId), isNull(t.deletedAt)),
    }),
  ]);

  return {
    isDeveloper: user?.developer !== null,
    ...membership,
  };
}

async function getMyMenus({
  fullAccess,
  roleId,
}: AccessParams): Promise<TMenu[]> {
  if (fullAccess) {
    return db.query.menus.findMany({
      where: (t, { and, or, eq, isNull }) =>
        and(isNull(t.parentId), isNull(t.deletedAt)),
      orderBy: (t, { asc }) => [asc(t.order)],
    });
  }

  if (!roleId) return [];

  const roleMenus = await db.query.roleMenus.findMany({
    with: {
      menus: true,
    },
    where: (t, { and, eq }) => and(eq(t.roleId, roleId)),
  });

  return roleMenus.map((item) => item.menus).filter(Boolean);
}

async function getMyOrgPermissions({
  fullAccess,
  roleId,
}: AccessParams): Promise<Pick<TPermission, 'resource' | 'action'>[]> {
  if (!roleId) return [];

  if (fullAccess) {
    return db.query.permissions.findMany({
      columns: {
        resource: true,
        action: true,
      },
      where: (t, { and, isNull }) => and(isNull(t.deletedAt)),
      orderBy: (t, { asc }) => [asc(t.createdAt)],
    });
  }

  const rolePermissions = await db.query.rolePermissions.findMany({
    with: {
      permission: {
        columns: {
          resource: true,
          action: true,
        },
      },
    },
    where: (t, { eq }) => eq(t.roleId, roleId),
  });

  return rolePermissions.map((item) => item.permission).filter(Boolean);
}

export { getUser, getMyMembership, getMyMenus, getMyOrgPermissions };
