import type { Locale } from "@/i18n/config";

export async function getDashboardMessages(locale: Locale) {
  const dashboard = (await import(`../(dashboard)/_messages/${locale}.json`))
    .default;

  const navigation = (
    await import(
      `../(dashboard)/(features)/navigation/_messages/${locale}.json`
    )
  ).default;

  const permission = (
    await import(`../(dashboard)/(permission)/_messages/${locale}.json`)
  ).default;

  const settings = (
    await import(`../(dashboard)/settings/_messages/${locale}.json`)
  ).default;

  return {
    ...dashboard,
    navigation,
    permission,
    settings,
  };
}
