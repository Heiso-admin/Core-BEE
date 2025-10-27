"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { roleMenus, rolePermissions } from "@/lib/db/schema";

async function assignMenus({
  roleId,
  menus,
}: {
  roleId: string;
  menus: string[];
}) {
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
}

async function assignPermissions({
  roleId,
  permissions,
}: {
  roleId: string;
  permissions: string[];
}) {
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
}

export { assignMenus, assignPermissions };
