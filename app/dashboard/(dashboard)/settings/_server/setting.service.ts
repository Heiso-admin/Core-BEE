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

    // 生成並儲存 JSON-LD（不顯示在頁面上）
    const domainUrl = (data.basic?.domain ?? '').replace(/\/$/, '');
    const orgName = data.branding?.organization ?? data.basic?.name ?? '';
    const logo = data.assets?.logo ?? '';
    const description = data.branding?.description ?? data.branding?.slogan ?? '';
    const social = (data as any)?.social;
    let sameAs: string[] = [];
    if (Array.isArray(social)) {
      // 向後相容：舊版為陣列格式
      sameAs = social
        .map((it: any) => (typeof it?.url === 'string' ? it.url.trim() : ''))
        .filter((url: string) => !!url);
    } else if (social && typeof social === 'object') {
      const fixedUrls = [social.facebook, social.instagram, social.x_twitter]
        .map((u: unknown) => (typeof u === 'string' ? u.trim() : ''))
        .filter((url: string) => !!url);
      const otherUrls = Array.isArray(social.others)
        ? social.others
          .map((it: any) => (typeof it?.url === 'string' ? it.url.trim() : ''))
          .filter((url: string) => !!url)
        : [];
      sameAs = [...fixedUrls, ...otherUrls];
    }

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: orgName,
      url: domainUrl || undefined,
      logo: logo || undefined,
      description: description || undefined,
      sameAs,
      contactPoint: domainUrl
        ? {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          url: `${domainUrl}/contact`,
        }
        : undefined,
    };

    await tx
      .insert(siteSettings)
      .values({ name: 'json-ld', value: jsonLd })
      .onConflictDoUpdate({
        target: siteSettings.name,
        set: { name: 'json-ld', value: jsonLd },
      });
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
