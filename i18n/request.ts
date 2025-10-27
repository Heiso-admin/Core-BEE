import { getRequestConfig } from 'next-intl/server';
import { getDashboardMessages } from '@/app/dashboard/_messages';
import { getUserLocale } from '@/server/locale';

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  const locale = await getUserLocale();

  // const common = (await import(`../messages/${locale}.json`)).default;
  const components = (await import(`@/components/_messages/${locale}.json`))
    .default;
  const auth = (await import(`../modules/auth/_messages/${locale}.json`))
    .default;
  const devCenter = (
    await import(`@/modules/dev-center/_messages/${locale}.json`)
  ).default;
  const account = (await import(`@/modules/account/_messages/${locale}.json`))
    .default;
  const apiKeys = (
    await import(
      `@/modules/dev-center/system/api-keys/_messages/${locale}.json`
    )
  ).default;

  const dashboard = await getDashboardMessages(locale);

  return {
    locale,
    messages: {
      // common,
      components,
      auth,
      devCenter,
      apiKeys,
      account,
      dashboard,
    },
  };
});
