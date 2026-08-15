'use client';

import { summarizePlain } from '@/lib/aiApi';
import SingleDocAiTool from './SingleDocAiTool';

export default function PlainLanguageSummary() {
  return (
    <SingleDocAiTool
      title="Plain-Language Summary Generator"
      description="Turn a complex contract into a summary a non-legal client can actually understand."
      runLabel="Generate Summary"
      onRun={(pages, token) => summarizePlain(pages, token, 'Contract')}
      renderResult={(summary) => (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink">{summary}</p>
        </div>
      )}
    />
  );
}
