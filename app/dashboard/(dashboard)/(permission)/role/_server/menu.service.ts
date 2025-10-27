"use server";

import { db } from "@/lib/db";
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

export { getMenus };
