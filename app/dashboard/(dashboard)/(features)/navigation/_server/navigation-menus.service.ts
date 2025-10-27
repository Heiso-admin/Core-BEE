"use server";

import { and, eq, inArray, isNull, like, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { navigationMenus } from "@/lib/db/schema";
import { recursiveList } from "@/lib/tree";

async function getMenu(navId: string, options?: { recursive?: boolean }) {
  const result = await db.query.navigationMenus.findMany({
    where: (t, { and, isNull }) =>
      and(isNull(t.deletedAt), eq(t.navigationId, navId)),
    orderBy: (t, { asc }) => [asc(t.createdAt)],
  });

  const data = options?.recursive ? recursiveList(result) : result;
  return {
    data,
    count: result.length,
  };
}

async function addMenu({
  navId,
  menu,
  revalidateUri,
}: {
  navId: string;
  menu: any;
  revalidateUri?: string;
}) {
  const result = await db
    .insert(navigationMenus)
    .values({
      navigationId: navId,
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
    .update(navigationMenus)
    .set({
      ...menu,
      updatedAt: new Date(),
    })
    .where(eq(navigationMenus.id, menu.id))
    .returning();

  revalidatePath("./navigation", "page");
  return result;
}

async function removeMenu(id: string) {
  // Get all menu items to find children
  const allItems = await db.query.navigationMenus.findMany({
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
    .update(navigationMenus)
    .set({ deletedAt: new Date() })
    .where(inArray(navigationMenus.id, idsToDelete))
    .returning();

  revalidatePath("./navigation", "page");

  return result;
}

async function updateMenuOrder(
  items: { id: string; parentId?: string | null; order: number }[],
) {
  const updates = items.map((item) => {
    return db
      .update(navigationMenus)
      .set({
        parentId: item.parentId,
        order: item.order,
        updatedAt: new Date(),
      })
      .where(eq(navigationMenus.id, item.id));
  });

  await Promise.all(updates);
  revalidatePath("./navigation", "page");
}

async function toggleMenuEnabled(id: string, enabled: boolean) {
  const result = await db
    .update(navigationMenus)
    .set({
      enabled,
      updatedAt: new Date(),
    })
    .where(eq(navigationMenus.id, id))
    .returning();

  revalidatePath("./navigation", "page");
  return result;
}

async function findMenuItemsInBulkByLinkIds(linkIds: string[]) {
  if (!Array.isArray(linkIds) || linkIds.length === 0) {
    console.warn("[Menu Search] 傳入的 linkIds 不是一個有效的陣列或為空，已終止查詢。收到的值:", linkIds);
    return [];
  }

  try {
    // 輕量級連線預熱，解決 Serverless 冷啟動問題
    await db.execute(sql`SELECT 1`);
    const likeConditions = linkIds.map(id => like(navigationMenus.link, `%${id}%`));

    const results = await db.query.navigationMenus.findMany({
      where: and(
        isNull(navigationMenus.deletedAt),
        or(...likeConditions)
      )
    });

    return results;

  } catch (error) {
    const originalErrorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`無法從資料庫獲取 Menu 項目。根本原因: ${originalErrorMessage}`);
  }
}

async function findAllMenuItemsByLinkId(linkId: string) {
  const results = await db.query.navigationMenus.findMany({
    where: (t, { and, isNull, like }) => 
      and(
        isNull(t.deletedAt),
        like(t.link, `%${linkId}%`)
      )
  });
  return results;
}


export {
  getMenu,
  addMenu,
  updateMenu,
  removeMenu,
  updateMenuOrder,
  toggleMenuEnabled,
  findMenuItemsInBulkByLinkIds,
  findAllMenuItemsByLinkId
};
