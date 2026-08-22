const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface PublicPlatformSettings {
  desktopDownloadUrl: string | null;
}

// Public, unauthenticated — the Download page needs this before any
// session exists. Null-on-any-failure, same contract as fetchCmsPage: a
// down/unreachable API must never break the page, just fall back to the
// existing "notify me" CTA.
export async function fetchPublicPlatformSettings(): Promise<PublicPlatformSettings | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(`${API_URL}/platform-settings/public`, { signal: controller.signal, cache: 'no-store' });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return (await res.json()) as PublicPlatformSettings;
  } catch {
    return null;
  }
}
