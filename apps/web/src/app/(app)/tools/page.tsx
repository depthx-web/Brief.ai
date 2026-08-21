import type { Metadata } from 'next';
import ToolsIndex from '@/components/ToolsIndex';
import { fetchCmsPage } from '@/lib/cmsApi';

const DEFAULT_META_TITLE = 'All Tools — Dossiera';
const DEFAULT_META_DESCRIPTION =
  'Every PDF and AI-powered document tool in one place — convert, organize, protect, and analyze, free for core tools with no account required.';

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchCmsPage('tools', false);
  return {
    title: page?.metaTitle ?? DEFAULT_META_TITLE,
    description: page?.metaDescription ?? DEFAULT_META_DESCRIPTION,
    ...(page?.ogImageUrl ? { openGraph: { images: [page.ogImageUrl] } } : {}),
  };
}

export default function ToolsPage() {
  return <ToolsIndex />;
}
