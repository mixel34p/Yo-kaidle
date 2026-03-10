import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './config';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid and ensure it's never undefined
  const isValidLocale = (value: string): value is (typeof locales)[number] =>
    locales.includes(value as (typeof locales)[number]);
  const requestedLocale = locale || defaultLocale;
  const validLocale = isValidLocale(requestedLocale) ? requestedLocale : defaultLocale;

  return {
    locale: validLocale,
    messages: {
      ...(await import(`./locales/${validLocale}/common.json`)).default,
      yokai: (await import(`./locales/${validLocale}/yokai.json`)).default
    }
  };
});
