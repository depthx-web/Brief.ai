import type { Metadata } from 'next';
import LoginForm from '@/components/LoginForm';
import { fetchCmsPage } from '@/lib/cmsApi';

const DEFAULT_META_TITLE = 'Log In — Dossiera';
const DEFAULT_META_DESCRIPTION = 'Log in to your Dossiera account to access AI-powered tools and your document library.';

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchCmsPage('login', false);
  return {
    title: page?.metaTitle ?? DEFAULT_META_TITLE,
    description: page?.metaDescription ?? DEFAULT_META_DESCRIPTION,
    ...(page?.ogImageUrl ? { openGraph: { images: [page.ogImageUrl] } } : {}),
  };
}

export default function LoginPage() {
  return <LoginForm />;
}
