"use server";

import { db } from "@heiso/core/lib/db";
import { recursiveList } from "@heiso/core/lib/tree";

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
