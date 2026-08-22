import type { Metadata } from 'next';
import SignupForm from '@/components/SignupForm';
import { fetchCmsPage } from '@/lib/cmsApi';
import { buildAlternates } from '@/lib/i18n/alternates';

const DEFAULT_META_TITLE = 'Sign Up — Dossiera';
const DEFAULT_META_DESCRIPTION =
  'Create a free Dossiera account — core PDF tools are free forever, with paid AI features per workspace.';

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchCmsPage('signup', false);
  return {
    title: page?.metaTitle ?? DEFAULT_META_TITLE,
    description: page?.metaDescription ?? DEFAULT_META_DESCRIPTION,
    alternates: buildAlternates('/signup'),
    ...(page?.ogImageUrl ? { openGraph: { images: [page.ogImageUrl] } } : {}),
  };
}

export default function SignupPage() {
  return <SignupForm />;
}
