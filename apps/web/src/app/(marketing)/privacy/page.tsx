import type { Metadata } from 'next';
import LegalLayout, { type LegalSection } from '@/components/LegalLayout';
import { fetchCmsPage } from '@/lib/cmsApi';

const DEFAULT_META_TITLE = 'Privacy Policy — Brief.ai';
const DEFAULT_META_DESCRIPTION =
  'How Brief.ai collects, processes, retains, and deletes your account and document data.';

const DEFAULT_SECTIONS: LegalSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    body: (
      <p>
        Brief.ai is a document tool built around a simple rule: your files are yours, and we keep as
        little of them as we can. This policy explains what we collect, how long we keep it, and
        when your documents are processed on our servers versus entirely inside your own browser.
      </p>
    ),
  },
  {
    id: 'information-we-collect',
    title: 'Information we collect',
    body: (
      <>
        <p>
          Creating an account requires only an email address, a password, and the professional
          workspace you choose (Lawyer, Accountant, or Researcher). If you sign in with Google, we
          receive your email and display name from your Google account instead.
        </p>
        <p>
          Documents you upload to your Library, and any files you send through an AI-powered tool,
          are received by our servers to process your request. Documents you process with a
          browser-only tool (merge, split, rotate, and similar) never leave your device.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use-information',
    title: 'How we use information',
    body: (
      <p>
        We use your account details to run the service — authenticating you, applying your plan's
        limits, and remembering your workspace preferences. Document content sent to an AI tool is
        used only to generate the response you asked for, in that single request. We do not use
        your document content to train any AI model, ours or a third party's.
      </p>
    ),
  },
  {
    id: 'data-retention',
    title: 'Data retention & auto-deletion',
    body: (
      <>
        <p>
          Files uploaded to a Library project are kept for 24 hours by default, then permanently
          deleted, unless you extend that project's retention to 7 or 30 days from the project's
          options menu. Once a project expires, its files are removed from our storage — there is no
          recovery period.
        </p>
        <p>
          Files sent through a server-side tool without being saved to your Library (a one-off
          conversion, for example) are deleted within one hour of the job completing.
        </p>
      </>
    ),
  },
  {
    id: 'ai-processing',
    title: 'AI processing',
    body: (
      <p>
        AI features are powered by third-party language model providers. The relevant page or
        question text is sent to the provider to generate a response and is not retained by Brief.ai
        beyond that request. We do not permit these providers to use your content to train their
        models.
      </p>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies & local storage',
    body: (
      <p>
        We use your browser's local storage to keep you signed in and to remember interface
        preferences like your last-used workspace. We do not use third-party advertising or
        tracking cookies.
      </p>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    body: (
      <p>
        You can update your name, email, or password at any time from Settings. You can delete any
        document or project individually, or permanently delete your entire account and every
        document in it from Settings — this action is immediate and cannot be undone.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: (
      <p>
        If we make a material change to how we handle your data, we will update the date at the top
        of this page and, where appropriate, notify you by email.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    body: (
      <p>
        Questions about this policy can be sent to{' '}
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
  const page = await fetchCmsPage('privacy', false);
  return {
    title: page?.metaTitle ?? DEFAULT_META_TITLE,
    description: page?.metaDescription ?? DEFAULT_META_DESCRIPTION,
    ...(page?.ogImageUrl ? { openGraph: { images: [page.ogImageUrl] } } : {}),
  };
}

export default async function PrivacyPage({ searchParams }: { searchParams: { cmsPreview?: string } }) {
  // Short-circuits before touching `searchParams` in the desktop static
  // export, where NEXT_PUBLIC_BUILD_TARGET is inlined at build time — reading
  // it at all forces Next.js's dynamic-render bailout, which static export
  // can't do. Preview mode has no meaning in the installed app anyway.
  const preview = process.env.NEXT_PUBLIC_BUILD_TARGET !== 'desktop' && searchParams.cmsPreview === '1';
  const page = await fetchCmsPage('privacy', preview);
  const sections = sectionsFromCms(page?.sections.body) ?? DEFAULT_SECTIONS;

  return <LegalLayout title="Privacy Policy" lastUpdated="August 15, 2026" sections={sections} />;
}
