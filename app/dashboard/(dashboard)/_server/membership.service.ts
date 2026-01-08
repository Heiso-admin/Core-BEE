"use server";

import { db } from "@heiso/core/lib/db";
import type { TMenu, TPermission } from "@heiso/core/lib/db/schema";
import { menus, roleMenus } from "@heiso/core/lib/db/schema";
import { auth } from "@heiso/core/modules/auth/auth.config";
import { and, asc, eq, isNull } from "drizzle-orm";

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

  const roleMenusData = await db
    .select({
      menu: menus,
    })
    .from(roleMenus)
    .leftJoin(menus, eq(roleMenus.menuId, menus.id))
    .where(and(eq(roleMenus.roleId, roleId), isNull(menus.deletedAt)))
    .orderBy(asc(menus.order));

  return roleMenusData.map((item) => item.menu).filter((i) => i !== null);
}

async function getMyOrgPermissions({
  fullAccess,
  roleId,
}: AccessParams): Promise<Pick<TPermission, "resource" | "action">[]> {
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
