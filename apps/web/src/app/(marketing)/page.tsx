import type { Metadata } from 'next';
import ReferralCapture from '@/components/ReferralCapture';
import HomeContent, { type CmsSections } from '@/components/HomeContent';
import { fetchCmsPage } from '@/lib/cmsApi';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const DEFAULT_META_TITLE = 'Dossiera — PDF Tools';
const DEFAULT_META_DESCRIPTION =
  'Professional PDF tools built for legal, accounting, and research professionals.';

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchCmsPage('home', false);
  return {
    title: page?.metaTitle ?? DEFAULT_META_TITLE,
    description: page?.metaDescription ?? DEFAULT_META_DESCRIPTION,
    ...(page?.ogImageUrl ? { openGraph: { images: [page.ogImageUrl] } } : {}),
  };
}

// Falls back to an empty sections object on any error — a CMS outage (or,
// on Vercel, simply no reachable backend yet) must never break the
// marketing homepage. HomeContent (client) then falls back further to its
// own locale-aware hardcoded defaults when a section is missing.
async function fetchCmsSections(preview: boolean, locale?: string): Promise<CmsSections> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    // See the matching comment in lib/cmsApi.ts — the desktop static export
    // bakes CMS content in at build time (force-cache) since there's no
    // server to revalidate against at runtime; the web deploy is unchanged.
    const cacheMode =
      process.env.NEXT_PUBLIC_BUILD_TARGET === 'desktop' ? 'force-cache' : preview ? 'no-store' : 'no-cache';
    const params = new URLSearchParams();
    if (preview) params.set('preview', '1');
    if (locale && locale !== 'en') params.set('locale', locale);
    const qs = params.toString();
    const res = await fetch(`${API_URL}/cms/pages/home${qs ? `?${qs}` : ''}`, {
      signal: controller.signal,
      cache: cacheMode,
    });
    clearTimeout(timeout);
    if (!res.ok) return {};
    const data = await res.json();
    return (data.sections ?? {}) as CmsSections;
  } catch {
    return {};
  }
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams: { cmsPreview?: string; ref?: string; locale?: string };
}) {
  // Swaps in an empty object before any property read in the desktop static
  // export — touching `searchParams` at all (cmsPreview here, ref below for
  // ReferralCapture) forces Next.js's dynamic-render bailout, which static
  // export can't do. Preview mode and referral tracking are both meaningless
  // in the installed desktop app anyway.
  const safeSearchParams = process.env.NEXT_PUBLIC_BUILD_TARGET === 'desktop' ? {} : searchParams;
  const preview = safeSearchParams.cmsPreview === '1';
  const sections = await fetchCmsSections(preview, safeSearchParams.locale);

  return (
    <>
      <ReferralCapture code={safeSearchParams.ref} />
      <HomeContent sections={sections} />
    </>
  );
}
