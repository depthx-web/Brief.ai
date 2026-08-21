import type { Metadata } from 'next';
import { Suspense } from 'react';
import DownloadContent from '@/components/DownloadContent';
import { fetchCmsPage } from '@/lib/cmsApi';

const DEFAULT_META_TITLE = 'Download — Brief.ai Desktop';
const DEFAULT_META_DESCRIPTION =
  'Get the Brief.ai desktop app — local PDF tools that run entirely on your machine, no upload required.';

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchCmsPage('download', false);
  return {
    title: page?.metaTitle ?? DEFAULT_META_TITLE,
    description: page?.metaDescription ?? DEFAULT_META_DESCRIPTION,
    ...(page?.ogImageUrl ? { openGraph: { images: [page.ogImageUrl] } } : {}),
  };
}

export default function DownloadPage() {
  return (
    <Suspense fallback={null}>
      <DownloadContent />
    </Suspense>
  );
}
