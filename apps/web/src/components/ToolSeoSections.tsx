'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchCmsPage } from '@/lib/cmsApi';
import { useLocale } from '@/lib/i18n/LocaleContext';
import { TOOL_SEO_CONTENT, type ToolFaqItem } from '@/lib/toolSeoContent';
import { TOOLS_BY_TAB, type Tab, type Tool } from './ToolsIndex';

function findTool(slug: string): { tool: Tool; tab: Tab } | null {
  for (const tab of Object.keys(TOOLS_BY_TAB) as Tab[]) {
    const tool = TOOLS_BY_TAB[tab].find((t) => t.href === `/${slug}`);
    if (tool) return { tool, tab };
  }
  return null;
}

// The standardized structural template every individual tool page follows
// (Features / FAQ / Privacy / Related Tools), below the tool's own upload
// UI. Web only — desktop tool pages use the sidebar shell instead (see
// ToolsChrome.tsx). Content is admin-editable via the CMS (Page slug
// `tools-<slug>`, sections `features`/`faq`); TOOL_SEO_CONTENT is the
// fallback shown until/unless an admin publishes an override.
export default function ToolSeoSections({ slug }: { slug: string }) {
  const found = findTool(slug);
  const defaults = TOOL_SEO_CONTENT[slug];
  const { locale } = useLocale();
  const [features, setFeatures] = useState<string[]>(defaults?.features ?? []);
  const [faq, setFaq] = useState<ToolFaqItem[]>(defaults?.faq ?? []);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    fetchCmsPage(`tools-${slug}`, false, locale).then((page) => {
      const featuresSection = page?.sections.features as { items?: string[] } | undefined;
      setFeatures(featuresSection?.items?.length ? featuresSection.items : defaults?.features ?? []);
      const faqSection = page?.sections.faq as { items?: ToolFaqItem[] } | undefined;
      setFaq(faqSection?.items?.length ? faqSection.items : defaults?.faq ?? []);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, locale]);

  if (!found) return null;

  // Any tool gated by a Feature (AI tools, and the handful of always-server
  // conversions/Protect/Remove Password) actually runs on our servers —
  // the same signal FeatureGuard itself gates on, not a guess.
  const isServerSide = Boolean(found.tool.featureKey);
  const related = TOOLS_BY_TAB[found.tab].filter((t) => t.href !== `/${slug}`).slice(0, 4);

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      {features.length > 0 && (
        <section>
          <h2 className="font-serif text-xl font-medium text-navy">Features</h2>
          <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
            {features.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-ink-soft">
                <span className="mt-1 text-[8px] text-emerald" aria-hidden>
                  ◆
                </span>
                {f}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-12 rounded-xl border border-paper-line bg-paper p-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-emerald" aria-hidden>
            <ShieldIcon />
          </span>
          <div>
            <p className="text-sm font-medium text-navy">
              {isServerSide ? 'Processed on our servers' : 'Processed locally, in your browser'}
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              {isServerSide
                ? 'This tool runs on our servers to do its work. Your file is automatically and permanently deleted afterward, per your retention setting.'
                : 'This tool runs entirely on your device — your file is never uploaded anywhere.'}
            </p>
          </div>
        </div>
      </section>

      {faq.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-xl font-medium text-navy">FAQ</h2>
          <div className="mt-2">
            {faq.map((item, i) => (
              <div key={item.q} className="border-t border-gray-200 py-4">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between text-left"
                >
                  <span className="font-medium text-navy">{item.q}</span>
                  <span className="text-ink-soft">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <p className="mt-2 text-sm text-ink-soft">{item.a}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="font-serif text-xl font-medium text-navy">Related Tools</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {related.map((t) => (
              <Link
                key={t.name}
                href={t.href}
                title={t.description}
                className="rounded-xl border-2 border-navy-light p-4 text-center transition-shadow hover:shadow-level-1"
              >
                <p className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink">{t.stamp}</p>
                <p className="mt-1.5 text-xs text-ink-soft">{t.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    </svg>
  );
}
