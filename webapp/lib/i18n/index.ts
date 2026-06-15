import { en } from './messages/en';
import { hinglish } from './messages/hinglish';
import { ur } from './messages/ur';
import type { Locale, Messages } from './types';

export * from './types';

const messages: Record<Locale, Messages> = {
  en,
  ur,
  hinglish,
};

export function getMessages(locale: Locale): Messages {
  return messages[locale] ?? en;
}

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : undefined;
}

export function translate(
  locale: Locale,
  key: string,
  params?: Record<string, string | number>,
): string {
  const value = getNestedValue(getMessages(locale) as unknown as Record<string, unknown>, key);
  if (!value) return key;

  if (!params) return value;

  return value.replace(/\{\{(\w+)\}\}/g, (_, name: string) => {
    const param = params[name];
    return param !== undefined ? String(param) : `{{${name}}}`;
  });
}
