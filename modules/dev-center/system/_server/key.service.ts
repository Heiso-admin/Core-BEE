"use server";

import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema/system/setting";

// import type { KeysFormValues } from '../key/page';

const KEY_GROUP = "api_keys";

type KeyMapping = {
  "openai.api_key": string;
  "github.access_token": string;
  "resend.api_key": string;
};

export async function getKeys() {
  const keySettings = await db.query.settings.findMany({
    where: eq(settings.group, KEY_GROUP),
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
        })
        .onConflictDoUpdate({
          target: [settings.name, settings.group],
          set: { value },
        }),
    ),
  );
}
