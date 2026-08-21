export const LOCALES = ['en', 'de', 'fr', 'es', 'it', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  it: 'Italiano',
  ar: 'العربية',
};

export const RTL_LOCALES: ReadonlySet<Locale> = new Set(['ar']);

export function isRtl(locale: Locale): boolean {
  return RTL_LOCALES.has(locale);
}

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

// Countries whose primary official/majority language matches one of our
// locales — used to pick a starting locale from IP geolocation. Deliberately
// small and conservative: anything not listed falls back to English rather
// than guessing.
const COUNTRY_TO_LOCALE: Record<string, Locale> = {
  DE: 'de',
  AT: 'de',
  CH: 'de',
  FR: 'fr',
  BE: 'fr',
  ES: 'es',
  MX: 'es',
  AR: 'es',
  CO: 'es',
  IT: 'it',
  SA: 'ar',
  AE: 'ar',
  EG: 'ar',
  QA: 'ar',
  KW: 'ar',
  MA: 'ar',
  DZ: 'ar',
  TN: 'ar',
  JO: 'ar',
  IQ: 'ar',
};

export function localeForCountry(countryCode: string | null | undefined): Locale {
  if (!countryCode) return 'en';
  return COUNTRY_TO_LOCALE[countryCode.toUpperCase()] ?? 'en';
}
