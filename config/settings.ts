import {
  getGeneralSettings,
  getSettings,
  getSiteSettings,
} from "@heiso/core/server/services/system/setting";
import type { Settings } from "@heiso/core/types/system";

export async function settings(withoutKey: boolean = false): Promise<Settings> {
  const data = await getSettings(withoutKey);
  // Prefer environment variable if set
  if (process.env.NOTIFY_EMAIL) {
    data["NOTIFY_EMAIL"] = process.env.NOTIFY_EMAIL;
  }
  if (process.env.RESEND_API_KEY) {
    data["RESEND_API_KEY"] = process.env.RESEND_API_KEY;
  }
  return data;
}

export function site(): Promise<Settings> {
  return getSiteSettings();
}

export function generalSettings(): Promise<Settings> {
  return getGeneralSettings();
}
