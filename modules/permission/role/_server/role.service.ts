"use server";

import { db } from "@heiso/core/lib/db";
import type {
  TMenu,
  TPermission,
  TRole,
  TRoleInsert,
  TRoleUpdate,
} from "@heiso/core/lib/db/schema";
import { roles } from "@heiso/core/lib/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getDynamicDb } from "@heiso/core/lib/db/dynamic";

export type Role = TRole & {
  menus: {
    menus: TMenu;
  }[];
  permissions: {
    permission: TPermission;
  }[];
};

async function getRoles(): Promise<Role[]> {
  const h = await headers();
  const tenantId = h.get("x-tenant-id");

  const tx = await getDynamicDb();
  const result = await tx.query.roles.findMany({
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
    where: (t, { and, isNull, eq }) => {
      const filters = [isNull(t.deletedAt)];
      if (tenantId) {
        filters.push(eq(t.tenantId, tenantId));
      }
      return and(...filters);
    },
    orderBy: (t, { asc }) => [asc(t.createdAt)],
  });

  return result;
}

async function createRole(data: Omit<TRoleInsert, "tenantId">) {
  const h = await headers();
  const tenantId = h.get("x-tenant-id");
  if (!tenantId) throw new Error("Tenant context missing");

  const tx = await getDynamicDb();
  const result = await tx.insert(roles).values({ ...data, tenantId });
  revalidatePath("/dashboard/role", "page");
  return result;
}

async function updateRole(id: string, data: TRoleUpdate) {
  const tx = await getDynamicDb();
  const result = await tx.update(roles).set(data).where(eq(roles.id, id));

  revalidatePath("/dashboard/role", "page");
  return result;
}

async function deleteRole({ id }: { id: string }) {
  const tx = await getDynamicDb();
  const result = await tx
    .update(roles)
    .set({
      deletedAt: new Date(),
    })
    .where(and(eq(roles.id, id), isNull(roles.deletedAt)));

  revalidatePath("/dashboard/role", "page");
  return result;
}

export { getRoles, createRole, updateRole, deleteRole };
