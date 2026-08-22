import type { Metadata } from 'next';
import LegalLayout, { type LegalSection } from '@/components/LegalLayout';
import { fetchCmsPage } from '@/lib/cmsApi';
import { buildAlternates } from '@/lib/i18n/alternates';

const DEFAULT_META_TITLE = 'Terms of Service — Dossiera';
const DEFAULT_META_DESCRIPTION =
  "The terms that govern use of Dossiera's free and paid PDF and AI-powered document tools.";

const DEFAULT_SECTIONS: LegalSection[] = [
  {
    id: 'acceptance',
    title: 'Acceptance of terms',
    body: (
      <p>
        By creating an account or using any tool on Dossiera, you agree to these terms. If you do
        not agree, please don't use the service.
      </p>
    ),
  },
  {
    id: 'the-service',
    title: 'Description of service',
    body: (
      <p>
        Dossiera provides PDF tools and AI-powered document analysis for legal, accounting, and
        research workflows. Some tools run entirely in your browser; others require uploading a
        file to our servers for processing, as described in our{' '}
        <a href="/privacy" className="text-emerald hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    ),
  },
  {
    id: 'plans',
    title: 'Free and paid plans',
    body: (
      <p>
        The free plan covers browser-only tools with no account required. AI features and
        server-side conversion are part of a paid workspace plan, billed on a weekly, monthly,
        quarterly, or yearly cycle through our payment processor. Prices and included features are
        shown on the Pricing page and may change with notice.
      </p>
    ),
  },
  {
    id: 'account-responsibilities',
    title: 'Account responsibilities',
    body: (
      <p>
        You're responsible for keeping your password confidential and for all activity under your
        account. Notify us right away if you believe your account has been accessed without
        authorization.
      </p>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use',
    body: (
      <p>
        You agree not to upload content you don't have the right to process, use the service to
        break the law, or attempt to disrupt, reverse-engineer, or gain unauthorized access to any
        part of Dossiera.
      </p>
    ),
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual property',
    body: (
      <p>
        You retain full ownership of every document you upload and every file our tools generate
        for you. Dossiera and its branding are our property; using the service doesn't grant you
        rights to either.
      </p>
    ),
  },
  {
    id: 'termination',
    title: 'Termination',
    body: (
      <p>
        You can delete your account at any time from Settings. We may suspend or terminate an
        account that violates these terms, misuses the service, or goes unpaid on a paid plan.
      </p>
    ),
  },
  {
    id: 'disclaimers',
    title: 'Disclaimers & limitation of liability',
    body: (
      <p>
        Dossiera is provided "as is." AI-generated analysis is a starting point, not professional
        legal, accounting, or research advice — always verify results before relying on them. To the
        extent permitted by law, Dossiera isn't liable for indirect or consequential damages arising
        from use of the service.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    body: (
      <p>
        We may update these terms as the product evolves. Material changes will be reflected in the
        date at the top of this page.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <p>
        Questions about these terms can be sent to{' '}
        <a href="mailto:support@brief.ai" className="text-emerald hover:underline">
          support@brief.ai
        </a>
        .
      </p>
    ),
  },
];

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function sectionsFromCms(fields: unknown): LegalSection[] | null {
  const items = (fields as { items?: { title: string; body: string }[] } | undefined)?.items;
  if (!items?.length) return null;
  return items.map((item) => ({
    id: slugify(item.title),
    title: item.title,
    body: item.body.split('\n\n').map((paragraph, i) => <p key={i}>{paragraph}</p>),
  }));
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await fetchCmsPage('terms', false);
  return {
    title: page?.metaTitle ?? DEFAULT_META_TITLE,
    description: page?.metaDescription ?? DEFAULT_META_DESCRIPTION,
    alternates: buildAlternates('/terms'),
    ...(page?.ogImageUrl ? { openGraph: { images: [page.ogImageUrl] } } : {}),
  };
}

export default async function TermsPage({ searchParams }: { searchParams: { cmsPreview?: string } }) {
  // See the matching comment in privacy/page.tsx — short-circuits before
  // touching `searchParams` in the desktop static export.
  const preview = process.env.NEXT_PUBLIC_BUILD_TARGET !== 'desktop' && searchParams.cmsPreview === '1';
  const page = await fetchCmsPage('terms', preview);
  const sections = sectionsFromCms(page?.sections.body) ?? DEFAULT_SECTIONS;

  return <LegalLayout title="Terms of Service" lastUpdated="August 15, 2026" sections={sections} />;
}
