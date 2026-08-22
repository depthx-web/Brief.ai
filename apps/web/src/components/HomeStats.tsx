'use client';

import { useEffect, useState } from 'react';
import Reveal from '@/components/Reveal';
import { useLocale } from '@/lib/i18n/LocaleContext';
import { fetchHomepageStats, type HomepageStatsPayload, type HomepageStatMetric } from '@/lib/statsApi';

const ICON_PROPS = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

// Fallback-mode anchor icons — one per metric, so a column never renders as
// bare floating text with nothing above it. Same 24x24 outline-icon house
// style as HomeContent.tsx's "how it works" icons.
function CheckCircleIcon() {
  return (
    <svg {...ICON_PROPS} className="h-8 w-8 text-emerald">
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.5 2.5 2.5L16 9.5" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg {...ICON_PROPS} className="h-8 w-8 text-emerald">
      <path d="M12.5 3 5 14h5.5L11 21l7.5-11H13z" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg {...ICON_PROPS} className="h-8 w-8 text-emerald">
      <path d="M12 3.5 5 6v6c0 4.2 2.9 7.4 7 8.5 4.1-1.1 7-4.3 7-8.5V6l-7-2.5Z" strokeLinejoin="round" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </svg>
  );
}

// Sits between the Hero/tagline block and #workspaces — see the homepage
// trust-stats spec. Relative metrics only (rates/percentages/averages), not
// absolute counts, so the section reads as credible regardless of current
// volume. Renders nothing if the API is unreachable or hasn't computed a
// first value yet, rather than showing placeholder numbers.
export default function HomeStats() {
  const { t } = useLocale();
  const [stats, setStats] = useState<HomepageStatsPayload | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHomepageStats().then((data) => {
      if (!cancelled) setStats(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats) return null;

  const columns: {
    metric: HomepageStatMetric;
    value: string;
    label: string;
    fallback: string;
    icon: () => React.JSX.Element;
    pulsing?: boolean;
  }[] = [
    {
      metric: stats.autoDeletionCompliance,
      value: `${Math.round(stats.autoDeletionCompliance.value ?? 0)}%`,
      label: t('homeStats.autoDeletionLabel'),
      fallback: t(
        stats.autoDeletionCompliance.fallbackVariant === 'allCompliant'
          ? 'homeStats.autoDeletionFallbackAll'
          : 'homeStats.autoDeletionFallbackDefault'
      ),
      icon: CheckCircleIcon,
    },
    {
      metric: stats.avgProcessingSeconds,
      value: t('homeStats.processingValue').replace('{s}', String(stats.avgProcessingSeconds.value ?? 0)),
      label: t('homeStats.processingLabel'),
      fallback: t('homeStats.processingFallback'),
      icon: BoltIcon,
      pulsing: true,
    },
    {
      metric: stats.clientSideShare,
      value: `${Math.round(stats.clientSideShare.value ?? 0)}%`,
      label: t('homeStats.clientShareLabel'),
      fallback: t('homeStats.clientShareFallback'),
      icon: ShieldIcon,
    },
  ];

  return (
    <section className="border-b border-gray-100 bg-surface px-6 py-16 sm:px-12">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 sm:flex-row sm:items-start sm:justify-center sm:gap-16">
        {columns.map((col, i) => {
          const Icon = col.icon;
          return (
            <Reveal key={i} delayMs={i * 80} className="flex w-[180px] flex-col items-center text-center">
              {/* Fixed-height anchor row: the big number (number-mode) or the
                  icon (fallback-mode) always sits here, so all three columns'
                  anchors land on the same horizontal line regardless of how
                  much text follows below. */}
              <div className="flex h-10 items-center justify-center gap-2">
                {col.metric.isFallback ? (
                  <Icon />
                ) : (
                  <>
                    <span className="font-serif text-[40px] font-medium leading-none text-navy">{col.value}</span>
                    {col.pulsing && (
                      <span
                        className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald"
                        style={{ boxShadow: '0 0 0 3px rgba(30,157,117,0.25)' }}
                        aria-hidden="true"
                      />
                    )}
                  </>
                )}
              </div>
              <p className="mt-3 font-sans text-[13px] leading-snug text-ink-soft">
                {col.metric.isFallback ? col.fallback : col.label}
              </p>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
