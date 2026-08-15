'use client';

import { detectSensitiveData } from '@/lib/aiApi';
import SingleDocAiTool from './SingleDocAiTool';

export default function RedactionDetector() {
  return (
    <SingleDocAiTool
      title="Auto-Redaction of Sensitive Data"
      description="Scans for ID numbers, bank account numbers, and similar identifiers worth redacting before sharing."
      runLabel="Scan for Sensitive Data"
      onRun={(pages, token) => detectSensitiveData(pages, token)}
      renderResult={(report) =>
        report.items.length === 0 ? (
          <p className="rounded-lg border border-gray-200 bg-white p-5 text-sm text-ink-soft">
            No sensitive data detected.
          </p>
        ) : (
          <ul className="space-y-3">
            {report.items.map((item, i) => (
              <li key={i} className="rounded-lg border border-redline/40 bg-red-50 p-4">
                <span className="rounded-full bg-redline px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                  {item.type}
                </span>
                <p className="mt-2 font-mono text-sm text-ink">{item.excerpt}</p>
              </li>
            ))}
          </ul>
        )
      }
    />
  );
}
