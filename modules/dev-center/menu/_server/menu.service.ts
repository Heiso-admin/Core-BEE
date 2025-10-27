"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import type { TMenuInsert, TMenuUpdate } from "@/lib/db/schema";
import { menus } from "@/lib/db/schema";
import { recursiveList } from "@/lib/tree";

async function getMenus({ recursive = false }: { recursive?: boolean }) {
  const result = await db.query.menus.findMany({
    where: (t, { isNull }) => isNull(t.deletedAt),
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
  const result = await db
    .insert(menus)
    .values({
      ...menu,
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
  const result = await db
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
  // Get all menu items to find children
  const allItems = await db.query.menus.findMany({
    where: (t, { isNull }) => isNull(t.deletedAt),
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
  const result = await db
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
  const updates = items.map((item) => {
    return db
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
