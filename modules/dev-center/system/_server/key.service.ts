"use server";

import { getDynamicDb } from "@heiso/core/lib/db/dynamic";
import { settings } from "@heiso/core/lib/db/schema/system/setting";
import { eq } from "drizzle-orm";

// import type { KeysFormValues } from '../key/page';

const KEY_GROUP = "api_keys";

type KeyMapping = {
  "openai.api_key": string;
  "github.access_token": string;
  "resend.api_key": string;
};

import { headers } from "next/headers";
import { sql } from "drizzle-orm";

export async function getKeys() {
  const db = await getDynamicDb();
  const h = await headers();
  const tenantId = h.get("x-tenant-id");

  const keySettings = await db.query.settings.findMany({
    where: (fields, { and, eq }) => {
      const filters = [eq(fields.group, KEY_GROUP)];
      if (tenantId) filters.push(eq(fields.tenantId, tenantId));
      return and(...filters);
    },
  });

  if (keySettings.length === 0) return null;

  const keys: any = {
    openai: { api_key: "" },
    github: { access_token: "" },
    resend: { api_key: "" },
  };

  // keySettings.forEach((setting) => {
  //   const [service, key] = setting.name.split('.');
  //   switch (setting.name as keyof KeyMapping) {
  //     case 'openai.api_key':
  //       keys.openai.api_key = setting.value;
  //       break;
  //     case 'github.access_token':
  //       keys.github.access_token = setting.value;
  //       break;
  //     case 'resend.api_key':
  //       keys.resend.api_key = setting.value;
  //       break;
  //   }
  // });

  return keys;
}

export async function saveKeys(data: any) {
  const db = await getDynamicDb();
  const h = await headers();
  const tenantId = h.get("x-tenant-id");
  if (!tenantId) throw new Error("Tenant context missing");

  const keyMappings: KeyMapping = {
    "openai.api_key": data.openai.api_key,
    "github.access_token": data.github.access_token,
    "resend.api_key": data.resend.api_key,
  };

  await Promise.all(
    Object.entries(keyMappings).map(([name, value]) =>
      db
        .insert(settings)
        .values({
          name,
          value,
          group: KEY_GROUP,
          isKey: true,
          tenantId,
        })
        .onConflictDoUpdate({
          target: [settings.tenantId, settings.name],
          set: { value },
          where: sql`${settings.tenantId} = ${tenantId}`,
        }),
    ),
  );
}
