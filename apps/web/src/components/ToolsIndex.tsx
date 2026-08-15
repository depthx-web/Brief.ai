'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import type { Segment } from '@/lib/authApi';
import ToolSourceModal from './ToolSourceModal';

interface Tool {
  href: string;
  name: string;
  stamp: string;
  description: string;
  pro?: boolean;
  ai?: boolean;
  // Omitted = every workspace. Set only on tools built for one profession
  // (e.g. Batch Invoice Export), so the grid re-filters on workspace switch.
  segments?: Segment[];
  // Only tools that take exactly one existing PDF get the "upload new vs.
  // choose from Library" modal — Merge/Images-to-PDF/etc. take a different
  // shape of input and go straight to their own page.
  singleFileSource?: boolean;
}

const TABS = ['Convert', 'Organize', 'Protect', 'AI tools'] as const;
type Tab = (typeof TABS)[number];

const TOOLS_BY_TAB: Record<Tab, Tool[]> = {
  Convert: [
    { href: '/pdf-to-images', name: 'PDF to Images', stamp: 'PDF→IMG', description: 'Export every page as a JPG or PNG.', singleFileSource: true },
    { href: '/images-to-pdf', name: 'Images to PDF', stamp: 'IMG→PDF', description: 'Combine JPG or PNG images into a PDF.' },
    { href: '/office-to-pdf', name: 'Office to PDF', stamp: 'DOC→PDF', description: 'Convert Word, Excel, or PowerPoint to PDF.', pro: true },
    { href: '/pdf-to-office', name: 'PDF to Office', stamp: 'PDF→DOC', description: 'Convert PDF to editable Word, Excel, or PowerPoint.', pro: true, singleFileSource: true },
  ],
  Organize: [
    { href: '/merge', name: 'Merge', stamp: 'MERGE', description: 'Combine multiple PDFs into one file.' },
    { href: '/split', name: 'Split', stamp: 'SPLIT', description: 'Extract page ranges or every page individually.', singleFileSource: true },
    { href: '/organize', name: 'Organize', stamp: 'ORDER', description: 'Reorder or delete pages within a PDF.', singleFileSource: true },
    { href: '/rotate', name: 'Rotate', stamp: 'ROTATE', description: 'Rotate every page in a PDF.', singleFileSource: true },
    { href: '/page-numbers', name: 'Page Numbers', stamp: 'PAGES', description: 'Stamp page numbers onto every page.', singleFileSource: true },
    { href: '/compress', name: 'Compress', stamp: 'ZIP', description: 'Shrink file size for scanned or image-heavy PDFs.', singleFileSource: true },
    { href: '/ocr', name: 'OCR', stamp: 'OCR', description: 'Make a scanned PDF searchable and selectable.', pro: true, singleFileSource: true },
  ],
  Protect: [
    { href: '/sign', name: 'Sign', stamp: 'SIGN', description: 'Draw or upload a signature and place it on a page.', singleFileSource: true },
    { href: '/protect', name: 'Protect', stamp: 'LOCK', description: 'Add a password so only people who know it can open the file.', pro: true, singleFileSource: true },
    { href: '/remove-password', name: 'Remove Password', stamp: 'UNLOCK', description: 'Remove password protection given the current password.', pro: true, singleFileSource: true },
  ],
  'AI tools': [
    {
      href: '/batch-invoices',
      name: 'Batch Invoice Export',
      stamp: 'INVOICE',
      description: 'Extract data from many invoices at once and export to CSV.',
      pro: true,
      ai: true,
      segments: ['ACCOUNTANT'],
    },
  ],
};

export default function ToolsIndex() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('Organize');
  const [sourceModalHref, setSourceModalHref] = useState<string | null>(null);
  const tools = useMemo(
    () => TOOLS_BY_TAB[tab].filter((tool) => !tool.segments || (user?.segment && tool.segments.includes(user.segment))),
    [tab, user?.segment]
  );

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <h1 className="font-serif text-2xl font-medium text-navy">All my tools in one place</h1>

      <div className="relative mt-8 flex gap-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-t-lg px-5 pb-3 pt-2.5 text-sm font-medium transition-all ${
              tab === t
                ? 'bg-paper text-navy shadow-[0_-2px_8px_rgba(0,0,0,0.06)]'
                : 'bg-gray-100 text-ink-soft opacity-70 hover:opacity-90'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="rounded-b-xl rounded-tr-xl border border-paper-line bg-paper p-8">
        <div key={`${tab}-${user?.segment}`} className="fade-in-200 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {tools.map((tool) => {
            const cardClass = `group relative flex aspect-square flex-col items-center justify-center rounded-2xl border-4 border-double bg-white p-4 text-center transition-transform duration-200 hover:-rotate-2 hover:shadow-lg ${
              tool.ai ? 'border-emerald' : 'border-ink/70'
            }`;
            const inner = (
              <>
                {tool.pro && (
                  <span className="absolute right-2 top-2 rounded bg-navy-light px-1.5 py-0.5 font-mono text-[9px] font-semibold text-white">
                    PRO
                  </span>
                )}
                {tool.ai && (
                  <span className="absolute left-2 top-2 text-emerald" aria-hidden>
                    ✨
                  </span>
                )}
                <span
                  className={`font-mono text-sm font-bold uppercase tracking-wide ${
                    tool.ai ? 'text-emerald' : 'text-ink'
                  }`}
                >
                  {tool.stamp}
                </span>
                <span className="mt-2 text-xs text-ink-soft">{tool.name}</span>
              </>
            );

            return tool.singleFileSource ? (
              <button key={tool.href} title={tool.description} onClick={() => setSourceModalHref(tool.href)} className={cardClass}>
                {inner}
              </button>
            ) : (
              <a key={tool.href} href={tool.href} title={tool.description} className={cardClass}>
                {inner}
              </a>
            );
          })}
        </div>
      </div>

      <ToolSourceModal open={sourceModalHref !== null} href={sourceModalHref} onClose={() => setSourceModalHref(null)} />
    </div>
  );
}
