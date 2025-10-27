"use server";

import { cookies } from "next/headers";
import { defaultLocale, type Locale } from "@/i18n/config";

const COOKIE_NAME = "_LOCALE";

export async function getUserLocale() {
  const cookieList = await cookies();
  return (cookieList.get(COOKIE_NAME)?.value || defaultLocale) as Locale;
}

export async function setUserLocale(locale: Locale) {
  const cookieList = await cookies();
  cookieList.set(COOKIE_NAME, locale);
}
