"use server";

import { db } from "@/lib/db";
import type { Settings } from "@/types/system";

export async function getSettings(): Promise<Settings> {
  const settings = await db.query.settings.findMany({
    where: (fields, { isNull }) =>
      // and(eq(fields.isKey, false), isNull(fields.deletedAt)),
      isNull(fields.deletedAt),
  });
  const result: Record<string, unknown> = {};
  for (const { name, value } of settings) {
    result[name] = value;
  }
  return result;
}

export async function getSiteSettings(): Promise<Settings> {
  const settings = await db.query.siteSettings.findMany({
    where: (fields, { isNull }) => isNull(fields.deletedAt),
  });
  const result: Record<string, unknown> = {};
  for (const { name, value } of settings) {
    result[name] = value;
  }
  return result;
}
