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
export async function fetchCmsPage(slug: string, preview: boolean): Promise<CmsPagePayload | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_URL}/cms/pages/${slug}${preview ? '?preview=1' : ''}`, {
      signal: controller.signal,
      cache: preview ? 'no-store' : 'no-cache',
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return (await res.json()) as CmsPagePayload;
  } catch {
    return null;
  }
}
