'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LOCALES, type Locale, isLocale, isRtl, localeForCountry } from './locales';
import type { DictionaryKey } from './dictionaries/en';
import en from './dictionaries/en';
import de from './dictionaries/de';
import fr from './dictionaries/fr';
import es from './dictionaries/es';
import it from './dictionaries/it';
import ar from './dictionaries/ar';

const DICTIONARIES: Record<Locale, Record<DictionaryKey, string>> = { en, de, fr, es, it, ar };

const COOKIE_NAME = 'brief-ai-locale';
const COOKIE_MAX_AGE_DAYS = 365;

function readCookieLocale(): Locale | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`));
  const value = match ? decodeURIComponent(match[1]) : null;
  return isLocale(value) ? value : null;
}

function writeCookieLocale(locale: Locale) {
  if (typeof document === 'undefined') return;
  const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${COOKIE_NAME}=${locale}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

// Best-guess only — a free, keyless IP geolocation lookup used purely to pick
// a starting locale on first visit. Never authoritative: the manual switcher
// always overrides it, and any failure just falls back to English.
async function detectCountryCode(): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.country_code === 'string' ? data.country_code : null;
  } catch {
    return null;
  }
}

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: DictionaryKey) => string;
  dir: 'ltr' | 'rtl';
  isDetecting: boolean;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [isDetecting, setIsDetecting] = useState(true);

  useEffect(() => {
    const fromCookie = readCookieLocale();
    if (fromCookie) {
      setLocaleState(fromCookie);
      setIsDetecting(false);
      return;
    }
    let cancelled = false;
    detectCountryCode().then((country) => {
      if (cancelled) return;
      const detected = localeForCountry(country);
      setLocaleState(detected);
      writeCookieLocale(detected);
      setIsDetecting(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = isRtl(locale) ? 'rtl' : 'ltr';
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    writeCookieLocale(next);
  }, []);

  const t = useCallback(
    (key: DictionaryKey) => DICTIONARIES[locale][key] ?? DICTIONARIES.en[key] ?? key,
    [locale]
  );

  const value = useMemo(
    () => ({ locale, setLocale, t, dir: isRtl(locale) ? ('rtl' as const) : ('ltr' as const), isDetecting }),
    [locale, setLocale, t, isDetecting]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within a LocaleProvider');
  return ctx;
}

export { LOCALES };
export type { Locale };
