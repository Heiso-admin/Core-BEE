"use server";

import { db } from "@/lib/db";

async function getMenus() {
  const result = await db.query.menus.findMany({
    columns: {
      id: true,
      title: true,
      icon: true,
    },
    where: (t, { isNull }) => isNull(t.deletedAt),
    orderBy: (t, { asc }) => [asc(t.order)],
  });

  return result;
}

export { getMenus };
