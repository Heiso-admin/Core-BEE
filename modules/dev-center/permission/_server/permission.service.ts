"use server";

import { getDynamicDb } from "@heiso/core/lib/db/dynamic";
import { permissions } from "@heiso/core/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function getPermissions() {
  const db = await getDynamicDb();
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
  db?: boolean;
};

async function groupPermissionsByMenu(
  menus: MinimalMenu[],
  permissions: MinimalPermission[],
  dbPermissions: MinimalPermission[],
) {
  // 合併時以穩定 key（id）為主；DB 覆寫同 id 的 config
  const map = new Map<string, MinimalPermission>();
  for (const p of permissions) {
    map.set(p.id, p);
  }
  for (const p of dbPermissions) {
    map.set(p.id, p);
  }
  const uniquePermissions = Array.from(map.values());

  return menus.map((menu) => {
    const menuPermissions = uniquePermissions.filter(
      (permission) => permission.menuId === menu.id,
    );

    return {
      id: menu.id,
      title: menu.title,
      icon: menu.icon,
      permissions: menuPermissions.map((p) => {
        const dbPermission = dbPermissions.find((dbP) => dbP.id === p.id);
        return {
          id: p.id,
          resource: p.resource,
          action: p.action,
          db: !!dbPermission,
        };
      }),
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
  const db = await getDynamicDb();
  const result = await db.insert(permissions).values({
    menuId,
    resource,
    action,
  });

  revalidatePath("/dev-center/permission", "page");
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
  const db = await getDynamicDb();
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
  const db = await getDynamicDb();
  const result = await db
    .update(permissions)
    .set({
      deletedAt: new Date(),
    })
    .where(and(eq(permissions.id, id), isNull(permissions.deletedAt)));

  revalidatePath("/dev-center/permission", "page");
  return result;
}

async function deletePermissionByKey({ id }: { id: string }) {
  const db = await getDynamicDb();
  const result = await db
    .update(permissions)
    .set({ deletedAt: new Date() })
    .where(and(eq(permissions.id, id), isNull(permissions.deletedAt)));

  revalidatePath("/dev-center/permission", "page");
  return result;
}

// Soft delete all current permissions (set deletedAt)
async function deleteAllPermissions() {
  const db = await getDynamicDb();
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
