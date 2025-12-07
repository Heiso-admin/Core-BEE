"use server";

import { db } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import type { Settings } from "@/types/system";
import type { Locale } from "@/i18n/config";
import type { SiteSetting } from "../settings/general/page";

async function getSettings(): Promise<Settings> {
  const settings = await db.query.settings.findMany({
    columns: { name: true, value: true },
    where: (fields, { and, eq, isNull }) =>
      and(eq(fields.isKey, false), isNull(fields.deletedAt)),
  });
  const result: Record<string, unknown> = {};
  for (const { name, value } of settings) {
    result[name] = value;
  }
  return result;
}

async function saveSetting() {
  // const result = await db.query.menus.findMany({
  //   columns: {
  //     id: true,
  //     title: true,
  //   },
  //   where: (t, { isNull }) => isNull(t.deletedAt),
  //   orderBy: (t, { asc }) => [asc(t.order)],
  // });
  // return result;
}

async function saveSiteSetting(data: SiteSetting) {
  await db.transaction(async (tx) => {
    await Promise.all(
      Object.keys(data).map(async (key) => {
        const value = data[key as keyof typeof data];
        await tx
          .insert(siteSettings)
          .values({
            name: key,
            value,
          })
          .onConflictDoUpdate({
            target: siteSettings.name,
            set: {
              name: key,
              value,
            },
          });
      }),
    );
  });
}

export { getSettings, saveSetting, saveSiteSetting };

// 將系統預設語言存入 site_settings.language = { default: <locale> }
export async function saveDefaultLanguage(locale: Locale) {
  await db
    .insert(siteSettings)
    .values({
      name: "language",
      value: { default: locale },
    })
    .onConflictDoUpdate({
      target: siteSettings.name,
      set: {
        name: "language",
        value: { default: locale },
      },
    });
}
