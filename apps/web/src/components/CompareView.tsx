'use client';

import { useMemo, useState } from 'react';
import * as Diff from 'diff';
import { computeDiffStats, diffTexts } from '@/lib/diffCompare';
import type { CompareFlag } from '@/lib/aiApi';
import { useLocale } from '@/lib/i18n/LocaleContext';
import type { DictionaryKey } from '@/lib/i18n/dictionaries/en';
import MiniFileCard from './MiniFileCard';

interface Props {
  leftLabel: string;
  rightLabel: string;
  leftText: string;
  rightText: string;
  flags: CompareFlag[];
  reportTitle: string;
  reportFilename: string;
}

const RISK_LABEL_KEY: Record<CompareFlag['riskLevel'], DictionaryKey> = {
  high: 'compareView.riskHigh',
  medium: 'compareView.riskMedium',
  low: 'compareView.riskLow',
};

function fillStatsLine(template: string, additions: number, deletions: number, reworded: number): string {
  return template
    .replace('{additions}', String(additions))
    .replace('{deletions}', String(deletions))
    .replace('{reworded}', String(reworded));
}

function findFlag(value: string, flags: CompareFlag[]): CompareFlag | undefined {
  const lower = value.toLowerCase();
  return flags.find((f) => f.excerpt.length > 2 && lower.includes(f.excerpt.toLowerCase()));
}

function DiffSpan({ part, flags }: { part: Diff.Change; flags: CompareFlag[] }) {
  const { t } = useLocale();
  const flag = findFlag(part.value, flags);
  const className = part.removed
    ? 'bg-red-50 text-redline line-through decoration-redline'
    : part.added
      ? 'bg-emerald-soft text-emerald-dark'
      : '';

  if (!flag) return <span className={className}>{part.value}</span>;

  return (
    <span className={`group relative ${className} cursor-help`}>
      {part.value}
      <span className="invisible absolute bottom-full left-1/2 z-10 mb-1.5 w-56 -translate-x-1/2 rounded-md bg-navy px-2.5 py-1.5 text-[11px] font-normal normal-case text-white opacity-0 shadow-level-2 transition-opacity group-hover:visible group-hover:opacity-100">
        <span className="mb-0.5 block font-mono text-[9px] uppercase tracking-wide text-[#8FA1BC]">
          {t(RISK_LABEL_KEY[flag.riskLevel])}
        </span>
        {flag.explanation}
      </span>
    </span>
  );
}

export default function CompareView({ leftLabel, rightLabel, leftText, rightText, flags, reportTitle, reportFilename }: Props) {
  const { t } = useLocale();
  const [showExport, setShowExport] = useState(false);
  const parts = useMemo(() => diffTexts(leftText, rightText), [leftText, rightText]);
  const stats = useMemo(() => computeDiffStats(parts), [parts]);
  const statsLine = fillStatsLine(
    t(stats.reworded === 1 ? 'compareView.statsLineSingular' : 'compareView.statsLinePlural'),
    stats.additions,
    stats.deletions,
    stats.reworded
  );

  const reportContent = useMemo(() => {
    const lines = [
      reportTitle,
      '',
      statsLine,
      '',
      t('compareView.flaggedChanges'),
      '',
    ];
    if (flags.length === 0) lines.push(t('compareView.noChangesFlagged'));
    flags.forEach((f, i) => {
      lines.push(`${i + 1}. [${f.riskLevel.toUpperCase()}] "${f.excerpt}"`, `   ${f.explanation}`, '');
    });
    return lines.join('\n');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flags, statsLine, reportTitle]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
        <span className="font-mono text-xs text-ink-soft">{statsLine}</span>
        <button
          onClick={() => setShowExport((v) => !v)}
          className="rounded-md bg-emerald px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-dark"
        >
          {showExport ? t('compareView.hideExport') : t('compareView.exportReport')}
        </button>
      </div>

      {showExport && (
        <div className="fade-in-200 mt-3">
          <MiniFileCard title={reportTitle} filename={reportFilename} content={reportContent} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">{leftLabel}</p>
          <div className="max-h-[560px] overflow-y-auto rounded-lg bg-paper p-6 shadow-level-1 [transform:rotate(-1deg)]">
            <p className="whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-[#3A3527]">
              {parts
                .filter((p) => !p.added)
                .map((part, i) => (
                  <DiffSpan key={i} part={part} flags={flags} />
                ))}
            </p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft">{rightLabel}</p>
          <div className="max-h-[560px] overflow-y-auto rounded-lg bg-paper p-6 shadow-level-1 [transform:rotate(1deg)]">
            <p className="whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-[#3A3527]">
              {parts
                .filter((p) => !p.removed)
                .map((part, i) => (
                  <DiffSpan key={i} part={part} flags={flags} />
                ))}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
