"use server";

import { db } from "@/lib/db";
import { generalSettings, siteSettings } from "@/lib/db/schema";
import type { Settings } from "@/types/system";
import type { SiteSetting } from "../site/page";

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

async function saveGeneralSetting(data: SiteSetting) {
  await db.transaction(async (tx) => {
    await Promise.all(
      Object.keys(data).map(async (key) => {
        const value = data[key as keyof typeof data];
        await tx
          .insert(generalSettings)
          .values({
            name: key,
            value,
          })
          .onConflictDoUpdate({
            target: generalSettings.name,
            set: {
              name: key,
              value,
            },
          });
      }),
    );
  });
}

export { getSettings, saveSetting, saveGeneralSetting, saveSiteSetting };
