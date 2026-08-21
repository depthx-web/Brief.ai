const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface CmsPagePayload {
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[] | null;
  ogImageUrl: string | null;
  sections: Record<string, unknown>;
}

// Server-side fetch used by both a page's content and its generateMetadata —
// short timeout and a null-on-any-failure contract so a CMS outage (or, on
// Vercel, simply no reachable backend yet) never breaks the page it backs.
// `locale` only ever comes from a client component (LocaleContext reads a
// browser cookie) — server-side/build-time calls have no request-scoped
// cookie access wired up yet, so they stay English by omitting it.
export async function fetchCmsPage(slug: string, preview: boolean, locale: string = 'en'): Promise<CmsPagePayload | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    // force-cache only applies to the desktop build's server-side/build-time
    // calls (output:'export' has no server to revalidate against at runtime,
    // and 'no-store'/'no-cache' would force Next's dynamic-render bailout,
    // which static export can't do). Client-side calls — like DesktopHome's
    // runtime useEffect fetch, which needs to see newly published content
    // on every app launch, not whatever got cached the first time — always
    // run in a real browser/webview (`window` defined), so this only ever
    // takes effect during the actual `next build` process.
    const isDesktopBuildTimeCall = typeof window === 'undefined' && process.env.NEXT_PUBLIC_BUILD_TARGET === 'desktop';
    const cacheMode = isDesktopBuildTimeCall ? 'force-cache' : preview ? 'no-store' : 'no-cache';
    const params = new URLSearchParams();
    if (preview) params.set('preview', '1');
    if (locale !== 'en') params.set('locale', locale);
    const qs = params.toString();
    const res = await fetch(`${API_URL}/cms/pages/${slug}${qs ? `?${qs}` : ''}`, {
      signal: controller.signal,
      cache: cacheMode,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return (await res.json()) as CmsPagePayload;
  } catch {
    return null;
  }
}
