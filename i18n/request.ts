import { getDashboardMessages } from "@heiso/core/app/dashboard/_messages";
import { getUserLocale } from "@heiso/core/server/locale";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  const locale = await getUserLocale();

  // const common = (await import(`../messages/${locale}.json`)).default;
  // const common = (await import(`../messages/${locale}.json`)).default;
  const components = (
    await import(`@heiso/core/components/_messages/${locale}.json`)
  ).default;
  const auth = (
    await import(`@heiso/core/modules/auth/_messages/${locale}.json`)
  ).default;
  const devCenter = (
    await import(`@heiso/core/modules/dev-center/_messages/${locale}.json`)
  ).default;
  const account = (
    await import(`@heiso/core/modules/account/_messages/${locale}.json`)
  ).default;
  const apiKeys = (
    await import(
      `@heiso/core/modules/dev-center/system/api-keys/_messages/${locale}.json`
    )
  ).default;
  const role = (
    await import(`@heiso/core/modules/permission/role/_messages/${locale}.json`)
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
      role,
    },
  };
});
