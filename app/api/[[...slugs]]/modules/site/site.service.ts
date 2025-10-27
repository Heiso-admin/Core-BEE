import { db } from "@/lib/db";

export async function getSiteSetting() {
  const settings = await db.query.siteSettings.findMany({
    where: (fields, { isNull }) => isNull(fields.deletedAt),
  });
  const result: Record<string, unknown> = {};
  for (const { name, value } of settings) {
    result[name] = value;
  }
  return result;
}

export async function getAnalyticsTools() {
  return await db.query.analyticsToolsSettings.findMany({
    columns: {
      id: true,
      name: true,
      trackingId: true,
    },
    where: (t, { isNull }) => isNull(t.deletedAt),
  });
}
