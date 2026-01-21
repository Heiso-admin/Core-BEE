"use server";

import { db } from "@heiso/core/lib/db";
import { roleMenus, rolePermissions } from "@heiso/core/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDynamicDb } from "@heiso/core/lib/db/dynamic";

async function assignMenus({
  roleId,
  menus,
}: {
  roleId: string;
  menus: string[];
}) {
  const db = await getDynamicDb();
  await db.transaction(async (tx) => {
    await tx.delete(roleMenus).where(eq(roleMenus.roleId, roleId));
    if (menus.length > 0) {
      await tx.insert(roleMenus).values(
        menus.map((menuId) => ({
          roleId,
          menuId,
        })),
      );
    }
  });
  revalidatePath("/dashboard/role", "page");
}

async function assignPermissions({
  roleId,
  permissions,
}: {
  roleId: string;
  permissions: string[];
}) {
  const db = await getDynamicDb();
  await db.transaction(async (tx) => {
    await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
    if (permissions.length > 0) {
      await tx.insert(rolePermissions).values(
        permissions.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      );
    }
  });
  revalidatePath("/dashboard/role", "page");
}

export { assignMenus, assignPermissions };
