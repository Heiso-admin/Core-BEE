"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { permissions, type TMenu, type TPermission } from "@/lib/db/schema";

async function getPermissions() {
  const result = await db.query.permissions.findMany({
    where: (t, { isNull }) => isNull(t.deletedAt),
  });

  return result;
}

async function groupPermissionsByMenu<T extends TMenu, P extends TPermission>(
  menus: Pick<T, "id" | "title">[],
  permissions: P[],
) {
  return menus.map((menu) => {
    const menuPermissions = permissions.filter((permission) => {
      return permission.menuId === menu.id;
    });

    return {
      id: menu.id,
      title: menu.title,
      permissions: menuPermissions.map((p) => ({
        id: p.id,
        resource: p.resource,
        action: p.action,
      })),
    };
  });
}

async function createPermission({
  menuId,
  resource,
  action,
}: {
  menuId?: string;
  resource: string;
  action: string;
}) {
  const result = await db.insert(permissions).values({
    menuId,
    resource,
    action,
  });

  revalidatePath("./permission/organization", "page");
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

  revalidatePath("./permission/organization", "page");
  return result;
}

async function deletePermission({ id }: { id: string }) {
  const result = await db
    .update(permissions)
    .set({
      deletedAt: new Date(),
    })
    .where(and(eq(permissions.id, id), isNull(permissions.deletedAt)));

  revalidatePath("./permission/organization", "page");
  return result;
}

export {
  getPermissions,
  groupPermissionsByMenu,
  createPermission,
  updatePermission,
  deletePermission,
};
