import { getRequestConfig } from 'next-intl/server';
import { getUserLocale } from '@/server/locale';

export default getRequestConfig(async () => {
  // Provide a static locale, fetch a user setting,
  const locale = await getUserLocale();

  return {
    locale,
    messages: {},
  };
});
