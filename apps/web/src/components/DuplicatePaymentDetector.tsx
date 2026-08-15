'use client';

import { detectDuplicatePayments } from '@/lib/aiApi';
import SingleDocAiTool from './SingleDocAiTool';

export default function DuplicatePaymentDetector() {
  return (
    <SingleDocAiTool
      title="Duplicate Payment Detector"
      description="Scans a batch of invoices or payment records for the same vendor, amount, and date appearing more than once."
      runLabel="Scan for Duplicates"
      onRun={(pages, token) => detectDuplicatePayments(pages, token)}
      renderResult={(report) =>
        report.duplicates.length === 0 ? (
          <p className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-ink-soft">
            No likely duplicate payments found.
          </p>
        ) : (
          <ul className="space-y-3">
            {report.duplicates.map((d, i) => (
              <li key={i} className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-ink">{d.description}</span>
                  <span className="font-mono text-ink-soft">{d.amount}</span>
                </div>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                  Appears {d.occurrences}×
                </p>
              </li>
            ))}
          </ul>
        )
      }
    />
  );
}
