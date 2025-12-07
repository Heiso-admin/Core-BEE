"use server";

import { cookies } from "next/headers";
import { defaultLocale, type Locale } from "@/i18n/config";
import { getGeneralSettings } from "@/server/services/system/setting";

const COOKIE_NAME = "_LOCALE";

export async function getUserLocale() {
  const cookieList = await cookies();
  const fromCookie = cookieList.get(COOKIE_NAME)?.value as Locale | undefined;
  if (fromCookie) return fromCookie;

  try {
    const general = await getGeneralSettings();
    const configured = (general?.language as any)?.default as Locale | undefined;
    return (configured || defaultLocale) as Locale;
  } catch {
    return defaultLocale;
  }
}

export async function setUserLocale(locale: Locale) {
  const cookieList = await cookies();
  cookieList.set(COOKIE_NAME, locale);
}
