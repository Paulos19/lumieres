import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    // O '../messages' sobe um nível (sai de 'i18n' para a raiz) e entra em 'messages'
    messages: (await import(`../messages/${locale}.json`)).default
  };
});