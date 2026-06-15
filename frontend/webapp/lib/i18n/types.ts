import type { en } from './messages/en';

export type Locale = 'en' | 'ur' | 'hinglish';

type DeepStringRecord<T> = {
  [K in keyof T]: T[K] extends string ? string : DeepStringRecord<T[K]>;
};

export type Messages = DeepStringRecord<typeof en>;

export type MessageKey = string;

export const LOCALES: { value: Locale; labelKey: 'en' | 'ur' | 'hinglish' }[] = [
  { value: 'en', labelKey: 'en' },
  { value: 'ur', labelKey: 'ur' },
  { value: 'hinglish', labelKey: 'hinglish' },
];

export const LOCALE_STORAGE_KEY = 'tameer360-locale';

export function localeDirection(locale: Locale): 'ltr' | 'rtl' {
  return locale === 'ur' ? 'rtl' : 'ltr';
}

export function localeHtmlLang(locale: Locale): string {
  if (locale === 'ur') return 'ur';
  if (locale === 'hinglish') return 'ur-PK';
  return 'en';
}
