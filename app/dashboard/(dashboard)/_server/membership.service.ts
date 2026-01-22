"use server";

import { getDynamicDb } from "@heiso/core/lib/db/dynamic";
import type { TMenu, TPermission } from "@heiso/core/lib/db/schema";
import { menus, roleMenus } from "@heiso/core/lib/db/schema";
import { auth } from "@heiso/core/modules/auth/auth.config";
import { and, asc, eq, isNull, sql } from "drizzle-orm";
import { headers } from "next/headers";

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

  const db = await getDynamicDb();
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

  const h = await headers();
  const tenantId = h.get("x-tenant-id");
  console.log("[DEBUG] getMyMembership userId:", userId, "tenantId:", tenantId);

  if (!tenantId) return { isDeveloper: false }; // Should not happen in normal flow

  const db = await getDynamicDb();

  return await db.transaction(async (tx) => {
     await tx.execute(sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`);
     
  const [user, membership] = await Promise.all([
    tx.query.users.findFirst({
      columns: { id: true },
      with: { developer: true },
      where: (t, { eq }) => eq(t.id, userId),
    }),
    tx.query.members.findFirst({
      columns: {
        id: true,
        roleId: true,
        isOwner: true,
        status: true,
        tenantId: true
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
            and(eq(t.userId, userId), isNull(t.deletedAt), eq(t.tenantId, tenantId)), // Explicit tenant filter + RLS
    }),
  ]);
    
    console.log("[DEBUG] getMyMembership found:", membership?.id, "roleId:", membership?.roleId);

  return {
    isDeveloper: user?.developer !== null,
    ...membership,
  };
  });
}

async function getMyMenus({
  fullAccess,
  roleId,
}: AccessParams): Promise<TMenu[]> {
  const h = await headers();
  const tenantId = h.get("x-tenant-id");
  console.log("[DEBUG] getMyMenus tenantId:", tenantId, "fullAccess:", fullAccess, "roleId:", roleId);

  if (!tenantId) return [];

  const db = await getDynamicDb();

  return await db.transaction(async (tx) => {
      await tx.execute(sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`);

  if (fullAccess) {
        const found = await tx.query.menus.findMany({
      where: (t, { and, or, eq, isNull }) =>
            and(isNull(t.parentId), isNull(t.deletedAt), eq(t.tenantId, tenantId)), // Explicit filter too
      orderBy: (t, { asc }) => [asc(t.order)],
    });
        console.log("[DEBUG] getMyMenus (fullAccess) found count:", found.length);
        return found;
  }

  if (!roleId) return [];

  const roleMenusData = await tx
    .select({
      menu: menus,
    })
    .from(roleMenus)
    .leftJoin(menus, eq(roleMenus.menuId, menus.id))
        .where(and(eq(roleMenus.roleId, roleId), isNull(menus.deletedAt))) // RLS handles tenant
    .orderBy(asc(menus.order));

      const final = roleMenusData.map((item) => item.menu).filter((i) => i !== null) as TMenu[];
      console.log("[DEBUG] getMyMenus (role) found count:", final.length);
      return final;
  });
}

async function getMyOrgPermissions({
  fullAccess,
  roleId,
}: AccessParams): Promise<Pick<TPermission, "resource" | "action">[]> {
  if (!roleId) return [];

  const db = await getDynamicDb();

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

  const rolePermissionsResult = await db.query.rolePermissions.findMany({
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

  return rolePermissionsResult.map((item) => item.permission).filter(Boolean);
}

export { getUser, getMyMembership, getMyMenus, getMyOrgPermissions };
