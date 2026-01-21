"use server";

import { db } from "@heiso/core/lib/db";
import { menus } from "@heiso/core/lib/db/schema";
import { recursiveList } from "@heiso/core/lib/tree";
import { eq, inArray, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { getDynamicDb } from "@heiso/core/lib/db/dynamic";

async function getMenus({ recursive = false }: { recursive?: boolean }) {
  const h = await headers();
  const tenantId = h.get("x-tenant-id");
  const tx = await getDynamicDb();

  const result = await tx.query.menus.findMany({
    where: (t, { and, isNull, eq }) => {
      const filters = [isNull(t.deletedAt)];
      if (tenantId) {
        filters.push(eq(t.tenantId, tenantId));
      }
      return and(...filters);
    },
    orderBy: (t, { asc }) => [asc(t.order)],
  });

  const data = recursive ? recursiveList(result) : result;
  return {
    data,
    count: result.length,
  };
}

async function addMenu({
  menu,
  revalidateUri,
}: {
  menu: any;
  revalidateUri?: string;
}) {
  const h = await headers();
  const tenantId = h.get("x-tenant-id");
  if (!tenantId) throw new Error("Tenant context missing");

  const tx = await getDynamicDb();

  const result = await tx
    .insert(menus)
    .values({
      ...menu,
      tenantId,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  if (revalidateUri) {
    revalidatePath(revalidateUri, "page");
  }
  return result;
}

async function updateMenu({
  menu,
  revalidateUri,
}: {
  menu: any;
  revalidateUri?: string;
}) {
  const tx = await getDynamicDb();
  const result = await tx
    .update(menus)
    .set({
      ...menu,
      updatedAt: new Date(),
    })
    .where(eq(menus.id, menu.id))
    .returning();

  if (revalidateUri) {
    console.log("revalidateUri: ", revalidateUri);
    revalidatePath(revalidateUri, "page");
  }
  return result;
}

async function removeMenu({ id }: { id: string }) {
  const h = await headers();
  const tenantId = h.get("x-tenant-id");
  const tx = await getDynamicDb();

  // Get all menu items to find children
  const allItems = await tx.query.menus.findMany({
    where: (t, { and, isNull, eq }) => {
      const filters = [isNull(t.deletedAt)];
      if (tenantId) {
        filters.push(eq(t.tenantId, tenantId));
      }
      return and(...filters);
    },
  });

  // Find all child ids recursively
  const findChildIds = (parentId: string): string[] => {
    const children = allItems.filter((item) => item.parentId === parentId);
    return [
      ...children.map((child) => child.id),
      ...children.flatMap((child) => findChildIds(child.id)),
    ];
  };

  // Get all ids to delete (current item + all children)
  const idsToDelete = [id, ...findChildIds(id)];

  // Delete all items
  const result = await tx
    .update(menus)
    .set({ deletedAt: new Date() })
    .where(inArray(menus.id, idsToDelete))
    .returning();

  revalidatePath("./menu/organization", "page");
  return result;
}

async function updateMenusOrder(
  items: { id: string; parentId: string | null; order: number }[],
) {
  const tx = await getDynamicDb(); // Use one tx for all updates if possible, or per operation
  // Since we execute in parallel with Promise.all, we should get tx first.
  
  const updates = items.map((item) => {
    return tx
      .update(menus)
      .set({
        parentId: item.parentId,
        order: item.order,
        updatedAt: new Date(),
      })
      .where(eq(menus.id, item.id));
  });

  await Promise.all(updates);
  revalidatePath("./menu", "page");
}

export { getMenus, addMenu, updateMenu, removeMenu, updateMenusOrder };

