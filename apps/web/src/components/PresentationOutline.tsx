'use client';

import { generateOutline } from '@/lib/aiApi';
import SingleDocAiTool from './SingleDocAiTool';

function downloadText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PresentationOutline() {
  return (
    <SingleDocAiTool
      title="Presentation Outline Generator"
      description="Turns the paper into a set of key talking points as a base for slides — exported as a structured text file, not a full .pptx."
      runLabel="Generate Outline"
      onRun={(pages, token) => generateOutline(pages, token)}
      renderResult={(outline) => (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-ink">{outline}</pre>
          <button
            onClick={() => downloadText(outline, 'presentation-outline.txt')}
            className="mt-4 rounded-md bg-navy-light px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-navy"
          >
            Download as text file
          </button>
        </div>
      )}
    />
  );
}
