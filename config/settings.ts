import { getSettings, getSiteSettings } from "@/server/services/system/setting";
import type { Settings } from "@/types/system";

export function settings(): Promise<Settings> {
  return getSettings();
}

export function site(): Promise<Settings> {
  return getSiteSettings();
}
