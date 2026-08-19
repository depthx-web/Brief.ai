import type { Metadata } from 'next';
import Link from 'next/link';
import DocumentDemo from '@/components/DocumentDemo';
import DesktopAppSection from '@/components/DesktopAppSection';
import Reveal from '@/components/Reveal';
import ReferralCapture from '@/components/ReferralCapture';
import { fetchCmsPage } from '@/lib/cmsApi';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const DEFAULT_META_TITLE = 'Brief.ai — PDF Tools';
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

interface HeroFields {
  eyebrow: string;
  headingLine1: string;
  headingLine2: string;
  subtext: string;
}

interface WorkspaceItem {
  eyebrow: string;
  title: string;
  description: string;
  features: string[];
}

interface TrustFields {
  heading: string;
}

interface FaqItem {
  q: string;
  a: string;
}

const DEFAULT_HERO: HeroFields = {
  eyebrow: 'AI-Powered PDF Platform',
  headingLine1: 'Your documents speak.',
  headingLine2: 'You just listen.',
  subtext:
    'Professional PDF tools built for three different worlds — contracts, invoices, and research papers. Brief.ai understands what each one means to an expert in that field.',
};

const WORKSPACE_PARAM: Record<string, string> = { Legal: 'legal', Accounting: 'accounting', Research: 'research' };

const DEFAULT_WORKSPACES: WorkspaceItem[] = [
  {
    eyebrow: 'Legal',
    title: 'For Lawyers & Firms',
    description:
      'Compare two versions of a contract, spot unusual clauses, and pull out obligations and dates automatically.',
    features: ['Contract comparison (redline)', 'Non-standard clause detection', 'Semantic search across your contract library'],
  },
  {
    eyebrow: 'Accounting',
    title: 'For Accountants & Small Business',
    description: 'Turn invoices and statements into clean, structured data ready to export in minutes.',
    features: ['High-accuracy data extraction', 'Automatic expense categorization', 'Ready export to QuickBooks/Xero'],
  },
  {
    eyebrow: 'Research',
    title: 'For Researchers & Grad Students',
    description: 'Chat with any research paper, summarize it your way, and pull a citation-ready reference list.',
    features: ['Chat with the paper', 'BibTeX / APA reference export', 'Searchable personal research library'],
  },
];

const TRUST_ITEMS = [
  {
    n: '01',
    title: 'Local processing by default',
    body: 'Simple operations run entirely inside your browser — no upload to any server.',
  },
  {
    n: '02',
    title: 'Strict auto-deletion',
    body: 'Anything that does need server-side processing is deleted permanently within one hour of completion.',
  },
  {
    n: '03',
    title: 'No training on your data',
    body: "Your document content is never used to train any AI model, ever.",
  },
];

const DEFAULT_TRUST: TrustFields = { heading: "Privacy isn't a feature. It's the foundation." };

const HOW_IT_WORKS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
        <path d="M7 18a4.6 4.4 0 0 1 0-9 5 4.5 0 0 1 9.8-1.5A4.5 4.5 0 0 1 18 18H7Z" strokeLinejoin="round" />
        <path d="M12 12v6M9.5 14.5 12 12l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    circleClass: 'bg-navy-light text-white',
    title: 'Upload',
    body: 'Drop a file or pick one from your library — no setup required.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" strokeLinecap="round" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    circleClass: 'bg-emerald text-white',
    title: 'AI analyzes it',
    body: 'Understood the way a professional in your field would read it.',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
        <path d="M4 12.5 9 17.5 20 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    circleClass: 'bg-navy-light text-white',
    title: 'Download or export',
    body: 'As a file, a summary, or straight into QuickBooks/Xero.',
  },
];

const DEFAULT_FAQ: FaqItem[] = [
  {
    q: 'Is my data safe?',
    a: 'Yes. Simple tools run entirely in your browser and never touch our servers. Anything that does need server-side processing — AI analysis, OCR, conversions — is deleted permanently within one hour of completion, and your documents are never used to train any AI model.',
  },
  {
    q: 'Do I need a credit card to start?',
    a: 'No. Merge, split, rotate, and compress are free forever with no account and no card required. You only pay once you want AI-powered analysis, chat, or comparisons.',
  },
  {
    q: 'What happens to my files after 24 hours?',
    a: 'Files saved to a Library project are automatically and permanently deleted after 24 hours, unless you extend that project’s retention to 7 or 30 days from its options menu.',
  },
  {
    q: 'Which plan is right for me?',
    a: 'Start with the workspace that matches your work — Legal, Accounting, or Research — then pick weekly, monthly, quarterly, or yearly billing. You can switch workspace or cycle anytime from your dashboard.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes, anytime from your account settings. You keep access through the end of your current billing period, and no cancellation fee applies.',
  },
];

interface CmsSections {
  hero?: HeroFields;
  workspaces?: { items: WorkspaceItem[] };
  trust?: TrustFields;
  faq?: { items: FaqItem[] };
}

// Falls back to the hardcoded defaults above on any error — a CMS outage
// (or, on Vercel, simply no reachable backend yet) must never break the
// marketing homepage. See the CMS migration's seed comment for why only
// Hero/Workspaces/Trust/FAQ are wired here.
async function fetchCmsSections(preview: boolean): Promise<CmsSections> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    // See the matching comment in lib/cmsApi.ts — the desktop static export
    // bakes CMS content in at build time (force-cache) since there's no
    // server to revalidate against at runtime; the web deploy is unchanged.
    const cacheMode =
      process.env.NEXT_PUBLIC_BUILD_TARGET === 'desktop' ? 'force-cache' : preview ? 'no-store' : 'no-cache';
    const res = await fetch(`${API_URL}/cms/pages/home${preview ? '?preview=1' : ''}`, {
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
  searchParams: { cmsPreview?: string; ref?: string };
}) {
  // Swaps in an empty object before any property read in the desktop static
  // export — touching `searchParams` at all (cmsPreview here, ref below for
  // ReferralCapture) forces Next.js's dynamic-render bailout, which static
  // export can't do. Preview mode and referral tracking are both meaningless
  // in the installed desktop app anyway.
  const safeSearchParams = process.env.NEXT_PUBLIC_BUILD_TARGET === 'desktop' ? {} : searchParams;
  const preview = safeSearchParams.cmsPreview === '1';
  const sections = await fetchCmsSections(preview);

  const hero = sections.hero ?? DEFAULT_HERO;
  const workspaces = sections.workspaces?.items ?? DEFAULT_WORKSPACES;
  const trust = sections.trust ?? DEFAULT_TRUST;
  const faq = sections.faq?.items ?? DEFAULT_FAQ;

  return (
    <>
      <ReferralCapture code={safeSearchParams.ref} />
      <section className="relative grid gap-10 overflow-hidden bg-gradient-to-b from-navy via-[#142A4D] to-navy-light px-6 py-20 text-white sm:px-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-24">
        <div className="relative z-[2]">
          <div className="mb-5 flex items-center gap-2.5 font-mono text-xs uppercase tracking-wider text-emerald before:h-px before:w-5 before:bg-emerald">
            {hero.eyebrow}
          </div>
          <h1 className="mb-5 max-w-xl font-serif text-4xl font-medium leading-tight sm:text-5xl">
            {hero.headingLine1}
            <br />
            <em className="text-emerald not-italic italic">{hero.headingLine2}</em>
          </h1>
          <p className="mb-8 max-w-md text-[17px] leading-relaxed text-[#C9D4E3]">{hero.subtext}</p>
          <div className="flex flex-wrap items-center gap-3.5">
            <Link
              href="/dashboard"
              className="rounded-md bg-emerald px-7 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(30,157,117,0.4)]"
            >
              Try Free Now
            </Link>
            <a
              href="#how-it-works"
              className="rounded-md border border-white/30 px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:border-white hover:bg-white/[0.06]"
            >
              See How It Works
            </a>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[#8FA1BC]">
            <span>⬤ Auto-delete within an hour</span>
            <span>⬤ Local processing in your browser</span>
            <span>⬤ No training on your data</span>
            <span className="text-emerald">◆ Core tools free, forever — no AI features needed to get started</span>
          </div>
        </div>

        <DocumentDemo />
      </section>

      <section className="border-b border-gray-100 bg-surface px-6 py-12 sm:px-12">
        <p className="text-center font-mono text-xs uppercase tracking-[1.5px] text-ink-soft">
          Built for how legal, accounting, and research teams actually review documents
        </p>
      </section>

      <section id="workspaces" className="mx-auto max-w-6xl px-6 py-24 sm:px-12">
        <div className="mb-14 max-w-xl">
          <div className="mb-3.5 font-mono text-xs uppercase tracking-wider text-emerald">
            Purpose-Built Workspaces
          </div>
          <h2 className="font-serif text-3xl font-medium leading-tight text-navy sm:text-4xl">
            One engine, three ways of working
          </h2>
          <p className="mt-3.5 text-base leading-relaxed text-ink-soft">
            Same underlying quality, wrapped in a completely different flow for each profession —
            reviewing a contract has nothing to do with reviewing an invoice or a research paper.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {workspaces.map((ws, i) => (
            <Reveal key={ws.eyebrow} delayMs={i * 80}>
              <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-7 transition-all hover:-translate-y-1 hover:border-emerald">
                <span className="mb-3.5 block font-mono text-[11px] uppercase tracking-wide text-emerald">
                  {ws.eyebrow}
                </span>
                <h3 className="mb-3 font-serif text-xl font-semibold text-navy">{ws.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-ink-soft">{ws.description}</p>
                <ul className="text-sm text-ink-soft">
                  {ws.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 border-t border-gray-100 py-1.5">
                      <span className="text-[8px] text-emerald">●</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href={`/tools?workspace=${WORKSPACE_PARAM[ws.eyebrow] ?? ws.eyebrow.toLowerCase()}`}
                  className="mt-4 text-[13px] font-medium text-emerald hover:underline"
                >
                  See all {ws.eyebrow} tools →
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-[1180px] px-6 py-24 sm:px-12">
        <div className="mb-14 max-w-xl">
          <div className="mb-3.5 font-mono text-xs uppercase tracking-wider text-emerald">How It Works</div>
          <h2 className="font-serif text-3xl font-medium leading-tight text-navy sm:text-4xl">
            Three steps, not thirty
          </h2>
        </div>
        <div className="relative grid gap-10 sm:grid-cols-3">
          <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-paper-line sm:block" aria-hidden />
          {HOW_IT_WORKS.map((step, i) => (
            <Reveal key={step.title} delayMs={i * 100}>
              <div className="relative flex flex-col items-start">
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-full ${step.circleClass}`}>
                  {step.icon}
                </div>
                <h3 className="mb-2 font-serif text-lg font-semibold text-navy">{step.title}</h3>
                <p className="text-sm leading-relaxed text-ink-soft">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <DesktopAppSection />

      <section id="trust" className="bg-navy px-6 py-16 text-white sm:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-14 lg:grid-cols-[1fr_1.4fr] lg:items-center">
            <h2 className="font-serif text-2xl font-medium sm:text-3xl">{trust.heading}</h2>
            <div className="flex flex-col gap-6">
              {TRUST_ITEMS.map((item) => (
                <div key={item.n} className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald/15 font-mono text-[13px] text-emerald">
                    {item.n}
                  </div>
                  <div>
                    <h4 className="mb-1 text-[15.5px] font-semibold">{item.title}</h4>
                    <p className="text-sm leading-relaxed text-[#9FB0C6]">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Reveal className="mt-8 flex flex-wrap gap-3 border-t border-white/15 pt-8">
            <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.08] px-3 py-1.5 font-mono text-[11px] text-white">
              🛡 GDPR-aligned
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.08] px-3 py-1.5 font-mono text-[11px] text-white">
              🔒 TLS encrypted
            </span>
          </Reveal>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-[760px] px-6 py-24 sm:px-12">
        <div className="mb-12 text-center">
          <div className="mb-3.5 font-mono text-xs uppercase tracking-wider text-emerald">Common Questions</div>
          <h2 className="font-serif text-3xl font-medium leading-tight text-navy sm:text-4xl">Before you ask</h2>
        </div>
        <div className="divide-y divide-paper-line border-t border-paper-line">
          {faq.map((item, i) => (
            <Reveal key={item.q} delayMs={i * 60}>
              <FaqRow question={item.q} answer={item.a} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-emerald-soft px-6 py-28 text-center sm:px-12">
        <h2 className="mx-auto mb-4 max-w-xl font-serif text-3xl font-medium text-navy">
          Start with one document, see the difference for yourself
        </h2>
        <p className="mx-auto mb-2 max-w-md text-base text-ink-soft">
          No credit card, no long signup — try the workspace built for your profession right now.
        </p>
        <p className="mx-auto mb-8 max-w-md text-sm text-ink-soft">
          Free forever for merge, split, compress &amp; rotate. Paid plans unlock AI analysis, chat, and comparisons.
        </p>
        <Link
          href="/dashboard"
          className="rounded-md bg-emerald px-7 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(30,157,117,0.4)]"
        >
          Try Brief.ai Free
        </Link>
      </section>
    </>
  );
}

function FaqRow({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group border-b border-paper-line py-5 [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-bold text-ink">
        {question}
        <span className="shrink-0 text-lg font-normal text-emerald transition-transform duration-200 group-open:rotate-45">
          +
        </span>
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{answer}</p>
    </details>
  );
}
