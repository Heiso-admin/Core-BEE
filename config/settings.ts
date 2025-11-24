import {
  getGeneralSettings,
  getSettings,
  getSiteSettings,
} from '@/server/services/system/setting';
import type { Settings } from '@/types/system';

export function settings(withoutKey: boolean = false): Promise<Settings> {
  return getSettings(withoutKey);
}

export function site(): Promise<Settings> {
  return getSiteSettings();
}

export function generalSettings(): Promise<Settings> {
  return getGeneralSettings();
}
