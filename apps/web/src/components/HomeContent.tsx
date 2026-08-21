'use client';

import Link from 'next/link';
import DocumentDemo from '@/components/DocumentDemo';
import DesktopAppSection from '@/components/DesktopAppSection';
import Reveal from '@/components/Reveal';
import { useLocale } from '@/lib/i18n/LocaleContext';
import { getHomeContent } from '@/lib/i18n/homeContent';

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

export interface CmsSections {
  hero?: HeroFields;
  workspaces?: { items: WorkspaceItem[] };
  trust?: TrustFields;
  faq?: { items: FaqItem[] };
}

// Index-based, not text-based — the eyebrow label is translated per locale,
// so it can never be used as the lookup key for the tools-page query param.
const WORKSPACE_PARAM_BY_INDEX = ['legal', 'accounting', 'research'];

const HOW_IT_WORKS_ICONS = [
  (
    <svg key="upload" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <path d="M7 18a4.6 4.4 0 0 1 0-9 5 4.5 0 0 1 9.8-1.5A4.5 4.5 0 0 1 18 18H7Z" strokeLinejoin="round" />
      <path d="M12 12v6M9.5 14.5 12 12l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  (
    <svg key="analyze" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  (
    <svg key="download" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-6 w-6">
      <path d="M4 12.5 9 17.5 20 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
];
const HOW_IT_WORKS_CIRCLE_CLASS = ['bg-navy-light text-white', 'bg-emerald text-white', 'bg-navy-light text-white'];

// Client-side because the actual visible copy (until an admin publishes a
// translated CMS override) is the hardcoded content in homeContent.ts, which
// needs the browser-detected locale (LocaleContext) — the parent page.tsx
// stays a Server Component only for generateMetadata/the CMS fetch/searchParams.
export default function HomeContent({ sections }: { sections: CmsSections }) {
  const { locale } = useLocale();
  const content = getHomeContent(locale);

  const hero = sections.hero ?? content.hero;
  const workspaces = sections.workspaces?.items ?? content.workspaces.items;
  const trust = sections.trust ?? content.trust;
  const faq = sections.faq?.items ?? content.faq.items;

  return (
    <>
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
              {content.hero.ctaPrimary}
            </Link>
            <a
              href="#how-it-works"
              className="rounded-md border border-white/30 px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:border-white hover:bg-white/[0.06]"
            >
              {content.hero.ctaSecondary}
            </a>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-[#8FA1BC]">
            {content.hero.bullets.map((b, i) => (
              <span key={i} className={i === content.hero.bullets.length - 1 ? 'text-emerald' : undefined}>
                {b}
              </span>
            ))}
          </div>
        </div>

        <DocumentDemo />
      </section>

      <section className="border-b border-gray-100 bg-surface px-6 py-12 sm:px-12">
        <p className="text-center font-mono text-xs uppercase tracking-[1.5px] text-ink-soft">{content.hero.builtForTagline}</p>
      </section>

      <section id="workspaces" className="mx-auto max-w-6xl px-6 py-24 sm:px-12">
        <div className="mb-14 max-w-xl">
          <div className="mb-3.5 font-mono text-xs uppercase tracking-wider text-emerald">{content.workspaces.kicker}</div>
          <h2 className="font-serif text-3xl font-medium leading-tight text-navy sm:text-4xl">{content.workspaces.heading}</h2>
          <p className="mt-3.5 text-base leading-relaxed text-ink-soft">{content.workspaces.subheading}</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {workspaces.map((ws, i) => (
            <Reveal key={i} delayMs={i * 80}>
              <div className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-7 transition-all hover:-translate-y-1 hover:border-emerald">
                <span className="mb-3.5 block font-mono text-[11px] uppercase tracking-wide text-emerald">{ws.eyebrow}</span>
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
                  href={`/tools?workspace=${WORKSPACE_PARAM_BY_INDEX[i] ?? 'legal'}`}
                  className="mt-4 text-[13px] font-medium text-emerald hover:underline"
                >
                  {content.workspaces.items[i]?.seeAllPrefix ?? 'See all'} {ws.eyebrow} →
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-[1180px] px-6 py-24 sm:px-12">
        <div className="mb-14 max-w-xl">
          <div className="mb-3.5 font-mono text-xs uppercase tracking-wider text-emerald">{content.howItWorks.kicker}</div>
          <h2 className="font-serif text-3xl font-medium leading-tight text-navy sm:text-4xl">{content.howItWorks.heading}</h2>
        </div>
        <div className="relative grid gap-10 sm:grid-cols-3">
          <div className="pointer-events-none absolute left-0 right-0 top-7 hidden h-px bg-paper-line sm:block" aria-hidden />
          {content.howItWorks.steps.map((step, i) => (
            <Reveal key={step.title} delayMs={i * 100}>
              <div className="relative flex flex-col items-start">
                <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-full ${HOW_IT_WORKS_CIRCLE_CLASS[i]}`}>
                  {HOW_IT_WORKS_ICONS[i]}
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
              {content.trust.items.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald/15 font-mono text-[13px] text-emerald">
                    {String(i + 1).padStart(2, '0')}
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
              {content.trust.gdprBadge}
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/[0.08] px-3 py-1.5 font-mono text-[11px] text-white">
              {content.trust.tlsBadge}
            </span>
          </Reveal>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-[760px] px-6 py-24 sm:px-12">
        <div className="mb-12 text-center">
          <div className="mb-3.5 font-mono text-xs uppercase tracking-wider text-emerald">{content.faq.kicker}</div>
          <h2 className="font-serif text-3xl font-medium leading-tight text-navy sm:text-4xl">{content.faq.heading}</h2>
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
        <h2 className="mx-auto mb-4 max-w-xl font-serif text-3xl font-medium text-navy">{content.closingCta.heading}</h2>
        <p className="mx-auto mb-2 max-w-md text-base text-ink-soft">{content.closingCta.paragraph1}</p>
        <p className="mx-auto mb-8 max-w-md text-sm text-ink-soft">{content.closingCta.paragraph2}</p>
        <Link
          href="/dashboard"
          className="rounded-md bg-emerald px-7 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(30,157,117,0.4)]"
        >
          {content.closingCta.cta}
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
        <span className="shrink-0 text-lg font-normal text-emerald transition-transform duration-200 group-open:rotate-45">+</span>
      </summary>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{answer}</p>
    </details>
  );
}
