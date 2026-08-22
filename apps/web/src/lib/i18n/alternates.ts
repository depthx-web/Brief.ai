import { LOCALES } from './locales';

export const SITE_URL = 'https://dossiera.com';

// English lives unprefixed at the root; every other locale is prefixed
// (`/de/pricing`) — see `middleware.ts` for why. `x-default` points at the
// English URL, telling Google which version to show a visitor whose
// language doesn't match any of ours.
export function localePath(path: string, locale: (typeof LOCALES)[number]): string {
  if (locale === 'en') return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

// Attach to any localizable page's `generateMetadata()` return value:
//   return { ...otherFields, alternates: buildAlternates('/pricing') };
export function buildAlternates(path: string): { canonical: string; languages: Record<string, string> } {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[locale] = `${SITE_URL}${localePath(path, locale)}`;
  }
  languages['x-default'] = `${SITE_URL}${path}`;
  return { canonical: `${SITE_URL}${path}`, languages };
}
