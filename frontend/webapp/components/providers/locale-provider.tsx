'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DirectionProvider } from '@/components/ui/direction';
import {
  LOCALE_STORAGE_KEY,
  localeDirection,
  localeHtmlLang,
  translate,
  type Locale,
} from '@/lib/i18n';

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dir: 'ltr' | 'rtl';
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored === 'en' || stored === 'ur' || stored === 'hinglish') return stored;
  return 'en';
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setLocaleState(readStoredLocale());
      setReady(true);
    });
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
    document.documentElement.lang = localeHtmlLang(next);
    document.documentElement.dir = localeDirection(next);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang = localeHtmlLang(locale);
    document.documentElement.dir = localeDirection(locale);
  }, [locale, ready]);

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      dir: localeDirection(locale),
    }),
    [locale, setLocale, t],
  );

  return (
    <LocaleContext.Provider value={value}>
      <DirectionProvider direction={value.dir}>{children}</DirectionProvider>
    </LocaleContext.Provider>
  );
}

export function StaticLocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(locale, key, params),
    [locale],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale: () => {},
      t,
      dir: localeDirection(locale),
    }),
    [locale, t],
  );

  return (
    <LocaleContext.Provider value={value}>
      <DirectionProvider direction={value.dir}>{children}</DirectionProvider>
    </LocaleContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within LocaleProvider');
  }
  return ctx;
}

export function useLabelMaps() {
  const { t } = useTranslation();

  return useMemo(
    () => ({
      customerType: (key: string) => t(`labels.customerType.${key}`),
      materialUnit: (key: string) => t(`labels.materialUnit.${key}`),
      materialCategory: (key: string) => t(`labels.materialCategory.${key}`),
      orderStatus: (key: string) => t(`labels.orderStatus.${key}`),
      dispatchStatus: (key: string) => t(`labels.dispatchStatus.${key}`),
      dispatchPaymentStatus: (key: string) =>
        t(`labels.dispatchPaymentStatus.${key}`),
      paymentMethod: (key: string) => t(`labels.paymentMethod.${key}`),
      vehicleType: (key: string) => t(`labels.vehicleType.${key}`),
      stockTransaction: (key: string) => t(`labels.stockTransaction.${key}`),
    }),
    [t],
  );
}
