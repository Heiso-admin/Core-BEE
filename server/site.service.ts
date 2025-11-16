'use server';

import { db } from '@/lib/db';
import type { SiteSetting } from '@/modules/dev-center/system/settings/general/page';

export async function getSiteSettings(): Promise<SiteSetting> {
  const settings = await db.query.siteSettings.findMany({
    where: (fields, { isNull }) => isNull(fields.deletedAt),
  });

  const result: Record<string, unknown> = {};
  for (const { name, value } of settings) {
    result[name] = value;
  }
  return result as SiteSetting;
}
