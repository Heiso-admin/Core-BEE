"use server";

import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type {
  TMenu,
  TPermission,
  TRole,
  TRoleInsert,
  TRoleUpdate,
} from "@/lib/db/schema";
import { roles } from "@/lib/db/schema";

export type Role = TRole & {
  menus: {
    menus: TMenu;
  }[];
  permissions: {
    permission: TPermission;
  }[];
};

async function getRoles(): Promise<Role[]> {
  const result = await db.query.roles.findMany({
    with: {
      menus: {
        with: {
          menus: true,
        },
      },
      permissions: {
        with: {
          permission: true,
        },
      },
    },
    where: (t, { isNull }) => isNull(t.deletedAt),
    orderBy: (t, { asc }) => [asc(t.createdAt)],
  });

  return result;
}

async function createRole(data: TRoleInsert) {
  const result = await db.insert(roles).values(data);
  revalidatePath("/dashboard/role", "page");
  return result;
}

async function updateRole(id: string, data: TRoleUpdate) {
  const result = await db.update(roles).set(data).where(eq(roles.id, id));

  revalidatePath("/dashboard/role", "page");
  return result;
}

async function deleteRole({ id }: { id: string }) {
  const result = await db
    .update(roles)
    .set({
      deletedAt: new Date(),
    })
    .where(and(eq(roles.id, id), isNull(roles.deletedAt)));

  revalidatePath("/dashboard/role", "page");
  return result;
}

export { getRoles, createRole, updateRole, deleteRole };
