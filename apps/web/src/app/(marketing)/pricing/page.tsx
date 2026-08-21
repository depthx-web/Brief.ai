import type { Metadata } from 'next';
import PricingPage from '@/components/PricingPage';
import { fetchCmsPage } from '@/lib/cmsApi';

const DEFAULT_META_TITLE = 'Pricing — Dossiera';
const DEFAULT_META_DESCRIPTION =
  'Plans for legal, accounting, and research professionals — free core tools, paid AI features per workspace.';

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchCmsPage('pricing', false);
  return {
    title: page?.metaTitle ?? DEFAULT_META_TITLE,
    description: page?.metaDescription ?? DEFAULT_META_DESCRIPTION,
    ...(page?.ogImageUrl ? { openGraph: { images: [page.ogImageUrl] } } : {}),
  };
}

export default function Pricing() {
  return <PricingPage />;
}
