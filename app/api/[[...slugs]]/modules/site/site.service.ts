import { getDynamicDb } from "@heiso/core/lib/db/dynamic";

export async function getSiteSetting() {
  const db = await getDynamicDb();
  const settings = await db.query.siteSettings.findMany({
    where: (fields, { isNull }) => isNull(fields.deletedAt),
  });
  const result: Record<string, unknown> = {};
  for (const { name, value } of settings) {
    result[name] = value;
  }
  return result;
}
