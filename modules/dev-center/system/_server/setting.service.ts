"use server";

import type { Locale } from "@heiso/core/i18n/config";
import { db } from "@heiso/core/lib/db";
import { siteSettings } from "@heiso/core/lib/db/schema";
import { sql } from "drizzle-orm";
import { headers } from "next/headers";
import type { Settings } from "@heiso/core/types/system";
import type { SiteSetting } from "../settings/general/page";

async function getSettings(): Promise<Settings> {
  const h = await headers();
  const tenantId = h.get("x-tenant-id");

  const settings = await db.query.settings.findMany({
    columns: { name: true, value: true },
    where: (fields, { and, eq, isNull }) => {
      const filters = [eq(fields.isKey, false), isNull(fields.deletedAt)];
      if (tenantId) {
        filters.push(eq(fields.tenantId, tenantId));
      }
      return and(...filters);
    },
  });
  const result: Record<string, unknown> = {};
  for (const { name, value } of settings) {
    result[name] = value;
  }
  return result;
}

async function saveSetting() {
  // Unimplemented
}

async function saveSiteSetting(data: SiteSetting) {
  const h = await headers();
  const tenantId = h.get("x-tenant-id");
  if (!tenantId) throw new Error("Tenant context missing");

  await db.transaction(async (tx) => {
    await Promise.all(
      Object.keys(data).map(async (key) => {
        const value = data[key as keyof typeof data];
        await tx
          .insert(siteSettings)
          .values({
            name: key,
            value,
            tenantId,
          })
          .onConflictDoUpdate({
            target: siteSettings.name,
            set: {
              name: key,
              value,
            },
            where: sql`${siteSettings.tenantId} = ${tenantId}`,
          });
      }),
    );
  });
}

export { getSettings, saveSetting, saveSiteSetting };

// 將系統預設語言存入 site_settings.language = { default: <locale> }
export async function saveDefaultLanguage(locale: Locale) {
  const h = await headers();
  const tenantId = h.get("x-tenant-id");
  if (!tenantId) throw new Error("Tenant context missing");

  await db
    .insert(siteSettings)
    .values({
      name: "language",
      value: { default: locale },
      tenantId,
    })
    .onConflictDoUpdate({
      target: siteSettings.name,
      set: {
        name: "language",
        value: { default: locale },
      },
      where: sql`${siteSettings.tenantId} = ${tenantId}`,
    });
}
