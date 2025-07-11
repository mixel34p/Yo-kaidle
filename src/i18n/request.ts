import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './config';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: {
      ...(await import(`./locales/${locale}/common.json`)).default,
      yokai: (await import(`./locales/${locale}/yokai.json`)).default
    }
  };
});
