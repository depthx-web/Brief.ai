'use client';

import { useEffect, useState } from 'react';
import Reveal from '@/components/Reveal';
import { useLocale } from '@/lib/i18n/LocaleContext';
import { fetchHomepageStats, type HomepageStatsPayload, type HomepageStatMetric } from '@/lib/statsApi';

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

  const columns: { metric: HomepageStatMetric; value: string; label: string; fallback: string; pulsing?: boolean }[] = [
    {
      metric: stats.autoDeletionCompliance,
      value: `${Math.round(stats.autoDeletionCompliance.value ?? 0)}%`,
      label: t('homeStats.autoDeletionLabel'),
      fallback: t(
        stats.autoDeletionCompliance.fallbackVariant === 'allCompliant'
          ? 'homeStats.autoDeletionFallbackAll'
          : 'homeStats.autoDeletionFallbackDefault'
      ),
    },
    {
      metric: stats.avgProcessingSeconds,
      value: t('homeStats.processingValue').replace('{s}', String(stats.avgProcessingSeconds.value ?? 0)),
      label: t('homeStats.processingLabel'),
      fallback: t('homeStats.processingFallback'),
      pulsing: true,
    },
    {
      metric: stats.clientSideShare,
      value: `${Math.round(stats.clientSideShare.value ?? 0)}%`,
      label: t('homeStats.clientShareLabel'),
      fallback: t('homeStats.clientShareFallback'),
    },
  ];

  return (
    <section className="border-b border-gray-100 bg-surface px-6 py-16 sm:px-12">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-10 sm:flex-row sm:justify-center sm:gap-16">
        {columns.map((col, i) => (
          <Reveal key={i} delayMs={i * 80} className="flex max-w-[180px] flex-col items-center text-center">
            {col.metric.isFallback ? (
              <p className="font-serif text-lg font-medium leading-snug text-navy">{col.fallback}</p>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-[40px] font-medium leading-none text-navy">{col.value}</span>
                  {col.pulsing && (
                    <span
                      className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald"
                      style={{ boxShadow: '0 0 0 3px rgba(30,157,117,0.25)' }}
                      aria-hidden="true"
                    />
                  )}
                </div>
                <p className="mt-2 font-sans text-[13px] leading-snug text-ink-soft">{col.label}</p>
              </>
            )}
          </Reveal>
        ))}
      </div>
    </section>
  );
}
