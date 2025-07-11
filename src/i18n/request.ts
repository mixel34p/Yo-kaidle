import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale } from './config';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid and ensure it's never undefined
  const validLocale = locale && locales.includes(locale as any) ? locale : defaultLocale;

  return {
    locale: validLocale,
    messages: {
      ...(await import(`./locales/${validLocale}/common.json`)).default,
      yokai: (await import(`./locales/${validLocale}/yokai.json`)).default
    }
  };
});
