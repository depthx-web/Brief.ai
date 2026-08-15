'use client';

import { useMemo, useState } from 'react';
import * as Diff from 'diff';
import { computeDiffStats, diffTexts } from '@/lib/diffCompare';
import type { CompareFlag } from '@/lib/aiApi';
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

const RISK_LABEL: Record<CompareFlag['riskLevel'], string> = {
  high: '⚠ High',
  medium: '⚠ Medium',
  low: 'ⓘ Low',
};

function findFlag(value: string, flags: CompareFlag[]): CompareFlag | undefined {
  const lower = value.toLowerCase();
  return flags.find((f) => f.excerpt.length > 2 && lower.includes(f.excerpt.toLowerCase()));
}

function DiffSpan({ part, flags }: { part: Diff.Change; flags: CompareFlag[] }) {
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
          {RISK_LABEL[flag.riskLevel]}
        </span>
        {flag.explanation}
      </span>
    </span>
  );
}

export default function CompareView({ leftLabel, rightLabel, leftText, rightText, flags, reportTitle, reportFilename }: Props) {
  const [showExport, setShowExport] = useState(false);
  const parts = useMemo(() => diffTexts(leftText, rightText), [leftText, rightText]);
  const stats = useMemo(() => computeDiffStats(parts), [parts]);

  const reportContent = useMemo(() => {
    const lines = [
      reportTitle,
      '',
      `${stats.additions} additions · ${stats.deletions} deletions · ${stats.reworded} reworded`,
      '',
      'Flagged changes:',
      '',
    ];
    if (flags.length === 0) lines.push('No notable changes flagged.');
    flags.forEach((f, i) => {
      lines.push(`${i + 1}. [${f.riskLevel.toUpperCase()}] "${f.excerpt}"`, `   ${f.explanation}`, '');
    });
    return lines.join('\n');
  }, [flags, stats, reportTitle]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
        <span className="font-mono text-xs text-ink-soft">
          {stats.additions} additions · {stats.deletions} deletions · {stats.reworded} clause{stats.reworded === 1 ? '' : 's'}{' '}
          reworded
        </span>
        <button
          onClick={() => setShowExport((v) => !v)}
          className="rounded-md bg-emerald px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-dark"
        >
          {showExport ? 'Hide export' : 'Export comparison report'}
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
