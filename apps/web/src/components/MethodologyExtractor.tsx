'use client';

import { extractMethodology } from '@/lib/aiApi';
import SingleDocAiTool from './SingleDocAiTool';

export default function MethodologyExtractor() {
  return (
    <SingleDocAiTool
      title="Methodology Extractor"
      description="Summarizes the methodology section into a structured table: sample, tools, and statistical analysis."
      runLabel="Extract Methodology"
      onRun={(pages, token) => extractMethodology(pages, token)}
      renderResult={(m) => (
        <table className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white text-sm">
          <tbody className="divide-y divide-gray-100">
            <tr>
              <th className="w-40 bg-surface px-4 py-3 text-start align-top font-medium text-ink">Sample</th>
              <td className="px-4 py-3 text-ink-soft">{m.sample}</td>
            </tr>
            <tr>
              <th className="w-40 bg-surface px-4 py-3 text-start align-top font-medium text-ink">Tools</th>
              <td className="px-4 py-3 text-ink-soft">{m.tools}</td>
            </tr>
            <tr>
              <th className="w-40 bg-surface px-4 py-3 text-start align-top font-medium text-ink">
                Statistical analysis
              </th>
              <td className="px-4 py-3 text-ink-soft">{m.statisticalAnalysis}</td>
            </tr>
          </tbody>
        </table>
      )}
    />
  );
}
