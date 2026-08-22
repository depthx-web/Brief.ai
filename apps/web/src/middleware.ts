import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { LOCALES, isLocale, type Locale } from './lib/i18n/locales';
import { isLocalizableRoute } from './lib/i18n/localizableRoutes';

const COOKIE_NAME = 'brief-ai-locale';

// Locales that get a URL prefix. English is the historically-indexed,
// already-linked-everywhere default and stays unprefixed at the root
// (`/pricing`, not `/en/pricing`) — this is what keeps every existing
// external link, the 37 tool-catalog hrefs, and the desktop static export
// (which never sees this middleware at all) working with zero changes.
const PREFIXED_LOCALES = LOCALES.filter((l) => l !== 'en');

function splitLocalePrefix(pathname: string): { locale: Locale | null; rest: string } {
  for (const locale of PREFIXED_LOCALES) {
    if (pathname === `/${locale}`) return { locale, rest: '/' };
    if (pathname.startsWith(`/${locale}/`)) return { locale, rest: pathname.slice(locale.length + 1) };
  }
  return { locale: null, rest: pathname };
}

// Coarse Accept-Language parsing — good enough to pick a starting locale,
// same "best guess, never authoritative" spirit as the IP-geolocation guess
// LocaleContext already does on first visit.
function localeFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const tags = header.split(',').map((part) => part.split(';')[0].trim().toLowerCase());
  for (const tag of tags) {
    const primary = tag.split('-')[0];
    if (isLocale(primary)) return primary;
  }
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin CMS preview overrides locale via ?locale=xx / ?cmsPreview=1 on the
  // plain unprefixed URL — never redirect/rewrite that, it must keep working
  // exactly as it does today.
  if (request.nextUrl.searchParams.has('locale') || request.nextUrl.searchParams.has('cmsPreview')) {
    return NextResponse.next();
  }

  const { locale: prefixLocale, rest } = splitLocalePrefix(pathname);

  if (prefixLocale) {
    // `/de/pricing` etc. — rewrite to the unprefixed route internally (the
    // file tree has no [locale] segment, by design: the desktop static
    // export shares this exact tree and needs unprefixed paths to keep
    // working) but only for routes actually meant to be localized.
    if (!isLocalizableRoute(rest)) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = rest;
    const res = NextResponse.rewrite(url);
    res.headers.set('x-locale', prefixLocale);
    res.cookies.set(COOKIE_NAME, prefixLocale, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
    return res;
  }

  if (!isLocalizableRoute(pathname)) return NextResponse.next();

  const cookieLocale = request.cookies.get(COOKIE_NAME)?.value;
  const resolved = isLocale(cookieLocale) ? cookieLocale : localeFromAcceptLanguage(request.headers.get('accept-language'));

  if (!resolved || resolved === 'en') return NextResponse.next();

  // A returning visitor (or one whose browser prefers a non-English
  // language) landing on the unprefixed URL gets sent to their locale's
  // real URL — one redirect, so each visitor converges on a single
  // canonical URL per locale instead of the same content living at both.
  const url = request.nextUrl.clone();
  url.pathname = `/${resolved}${pathname === '/' ? '' : pathname}`;
  const res = NextResponse.redirect(url);
  res.cookies.set(COOKIE_NAME, resolved, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' });
  return res;
}

export const config = {
  matcher: ['/((?!_next/|api/|.*\\..*).*)'],
};
