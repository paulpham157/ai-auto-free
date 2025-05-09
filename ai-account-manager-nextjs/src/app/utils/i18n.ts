import { useLocale } from '../context/LocaleContext';
import enMessages from '../../../messages/en.json';
import trMessages from '../../../messages/tr.json';
import deMessages from '../../../messages/de.json';
import arMessages from '../../../messages/ar.json';
import frMessages from '../../../messages/fr.json';
import ruMessages from '../../../messages/ru.json';
import ptMessages from '../../../messages/pt.json';
import zhMessages from '../../../messages/zh.json';

const messages = {
  en: enMessages,
  tr: trMessages,
  de: deMessages,
  ar: arMessages,
  fr: frMessages,
  ru: ruMessages,
  pt: ptMessages,
  zh: zhMessages
};

/**
 * A utility function that returns translations based on the current locale
 *
 * @example
 * // Usage in a component
 * import { useTranslations } from '@/utils/i18n';
 *
 * function MyComponent() {
 *   const t = useTranslations();
 *   return <h1>{t.login.title}</h1>;
 * }
 */
export function useTranslations() {
  const { locale } = useLocale();

  // Default to English if the locale is not supported or messages are missing
  return messages[locale as keyof typeof messages] || messages.en;
}

/**
 * A utility function to translate a specific key
 * Can be used in places where the hooks can't be used
 *
 * @param locale The locale code
 * @param key Dot-notation path to the translation key
 * @param defaultValue Default value if translation is not found
 */
export function getTranslation(locale: string, key: string, defaultValue: string = ''): string {
  const localeMessages = messages[locale as keyof typeof messages] || messages.en;

  // Split the key by dots and traverse the messages object
  const keys = key.split('.');
  let result: any = localeMessages;

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      return defaultValue;
    }
  }

  return typeof result === 'string' ? result : defaultValue;
}
