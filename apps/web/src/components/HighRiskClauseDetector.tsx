'use client';

import { analyzeClauses } from '@/lib/aiApi';
import SingleDocAiTool from './SingleDocAiTool';

export default function HighRiskClauseDetector() {
  return (
    <SingleDocAiTool
      title="High-Risk Clause Detector"
      description="Flags unfair, incomplete, or non-standard clauses and pulls out parties, dates, amounts, and obligations."
      runLabel="Detect Clauses"
      onRun={(pages, token) => analyzeClauses(pages, token, 'Contract')}
      renderResult={(analysis) => (
        <div className="space-y-5">
          {analysis.clauses.length > 0 ? (
            <ul className="space-y-3">
              {analysis.clauses.map((c, i) => (
                <li key={i} className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm">
                  <span className="rounded-full bg-amber-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-800">
                    {c.category}
                  </span>
                  <p className="mt-2 italic text-ink-soft">&ldquo;{c.excerpt}&rdquo;</p>
                  <p className="mt-1 text-ink-soft">{c.explanation}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-soft">No flagged clauses.</p>
          )}
          <dl className="space-y-3 text-sm">
            {(['parties', 'dates', 'amounts', 'obligations'] as const).map((key) => (
              <div key={key}>
                <dt className="font-medium capitalize text-ink">{key}</dt>
                <dd className="text-ink-soft">{analysis.entities[key].length > 0 ? analysis.entities[key].join(', ') : '—'}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    />
  );
}
