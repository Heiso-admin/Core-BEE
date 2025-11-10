"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { permissions } from "@/lib/db/schema";

async function getPermissions() {
  const result = await db.query.permissions.findMany({
    where: (t, { isNull }) => isNull(t.deletedAt),
  });

  return result;
}

type MinimalMenu = { id: string; title: string; icon: string | null };
type MinimalPermission = {
  id: string;
  resource: string;
  action: string;
  menuId?: string | null;
};

async function groupPermissionsByMenu(
  menus: MinimalMenu[],
  permissions: MinimalPermission[],
) {
  const dbPermissions = await getPermissions();

  return menus.map((menu) => {
    const menuPermissions = permissions.filter((permission) => {
      return permission.menuId === menu.id;
    });

    const dbMenuPermission = dbPermissions.filter((dbPermission) => {
      return dbPermission.menuId === menu.id;
    })

    return {
      id: menu.id,
      title: menu.title,
      icon: menu.icon,
      permissions: menuPermissions.map((p) => {
        const existing = dbMenuPermission.find(
          (dbPermission) =>
            dbPermission.id === p.id
        );
        return {
          id: p.id,
          resource: p.resource,
          action: p.action,
          checked: Boolean(existing),
        };
      }),
    };
  });
}

async function createPermission({
  id,
  menuId,
  resource,
  action,
}: {
  id: string;
  menuId?: string;
  resource: string;
  action: string;
}) {
  // Upsert by id: if exists (even soft-deleted), restore and update fields
  const result = await db
    .insert(permissions)
    .values({ id, menuId, resource, action })
    .onConflictDoUpdate({
      target: permissions.id,
      set: {
        menuId,
        resource,
        action,
        deletedAt: null,
        updatedAt: new Date(),
      },
    })
    .returning({ id: permissions.id, menuId: permissions.menuId });

  return result;
}

async function updatePermission({
  id,
  resource,
  action,
}: {
  id: string;
  resource: string;
  action: string;
}) {
  const result = await db
    .update(permissions)
    .set({
      resource,
      action,
    })
    .where(eq(permissions.id, id));

  revalidatePath("/dev-center/permission", "page");
  return result;
}

async function deletePermission({ id }: { id: string }) {
  const result = await db
    .update(permissions)
    .set({
      deletedAt: new Date(),
    })
    .where(and(eq(permissions.id, id), isNull(permissions.deletedAt)));
  return result;
}

async function deletePermissionByKey({ id }: { id: string }) {
  const result = await db
    .update(permissions)
    .set({ deletedAt: new Date() })
    .where(and(eq(permissions.id, id), isNull(permissions.deletedAt)));

  // Optimistic UI removes the check immediately; skip page revalidation
  return result;
}

// Soft delete all current permissions (set deletedAt)
async function deleteAllPermissions() {
  const result = await db
    .update(permissions)
    .set({ deletedAt: new Date() })
    .where(isNull(permissions.deletedAt));

  // Refresh the permission page to reflect all unchecked states
  revalidatePath("/dev-center/permission", "page");
  return result;
}

export {
  getPermissions,
  groupPermissionsByMenu,
  createPermission,
  updatePermission,
  deletePermission,
  deletePermissionByKey,
  deleteAllPermissions,
};
