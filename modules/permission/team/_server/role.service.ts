"use server";

import { getDynamicDb } from "@heiso/core/lib/db/dynamic";

async function getRoles() {
  const db = await getDynamicDb();
  const result = await db.query.roles.findMany({
    columns: {
      id: true,
      name: true,
      loginMethod: true,
    },
    where: (t, { isNull }) => isNull(t.deletedAt),
    orderBy: (t, { asc }) => [asc(t.createdAt)],
  });

  return result;
}

export { getRoles };
