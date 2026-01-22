"use server";

import { getDynamicDb } from "@heiso/core/lib/db/dynamic";
import type { SiteSetting } from "@heiso/core/modules/dev-center/system/settings/general/page";

export async function getSiteSettings(): Promise<SiteSetting> {
  const db = await getDynamicDb();
  const settings = await db.query.siteSettings.findMany({
    where: (fields, { isNull }) => isNull(fields.deletedAt),
  });

  const result: Record<string, unknown> = {};
  for (const { name, value } of settings) {
    result[name] = value;
  }
  return result as SiteSetting;
}
