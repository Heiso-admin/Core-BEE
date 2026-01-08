"use server";

import { db } from "@heiso/core/lib/db";
import type { Settings } from "@heiso/core/types/system";

export async function getSettings(
  withoutKey: boolean = false,
): Promise<Settings> {
  const settings = await db.query.settings.findMany({
    columns: { name: true, value: true },
    where: (fields, { and, eq, isNull }) =>
      and(
        withoutKey ? eq(fields.isKey, false) : undefined,
        isNull(fields.deletedAt),
      ),
  });
  const result: Record<string, unknown> = {};
  for (const { name, value } of settings) {
    result[name] = value;
  }
  return result;
}

export async function getGeneralSettings(): Promise<Settings> {
  const settings = await db.query.generalSettings.findMany({
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
