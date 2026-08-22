'use client';

import { useState } from 'react';
import { generateFilePdf } from '@/lib/generateFilePdf';
import { convertPdfToOffice, downloadBlob } from '@/lib/convertApi';
import { useLocale } from '@/lib/i18n/LocaleContext';

interface Props {
  title: string;
  filename: string;
  content: string;
}

function approxSizeLabel(content: string): string {
  const bytes = content.length + 300;
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(0)} KB`;
}

// Unified pattern for any AI-generated downloadable file in the chat —
// shown as a small "physical document" card (bg=paper, matching how every
// other document representation in the app looks) rather than plain text.
export default function MiniFileCard({ title, filename, content }: Props) {
  const { t } = useLocale();
  const [generating, setGenerating] = useState<'pdf' | 'word' | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDownloadPdf() {
    setGenerating('pdf');
    setError(null);
    try {
      const blob = await generateFilePdf(title, content);
      downloadBlob(blob, `${filename}.pdf`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('miniFileCard.couldNotGeneratePdf'));
    } finally {
      setGenerating(null);
    }
  }

  async function handleDownloadWord() {
    setGenerating('word');
    setError(null);
    try {
      const pdfBlob = await generateFilePdf(title, content);
      const pdfFile = new File([pdfBlob], `${filename}.pdf`, { type: 'application/pdf' });
      const { blob, filename: outName } = await convertPdfToOffice(pdfFile, 'word');
      downloadBlob(blob, outName);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('miniFileCard.couldNotGenerateWord'));
    } finally {
      setGenerating(null);
    }
  }

  return (
    <div className="w-[260px] rounded-lg border border-paper-line bg-paper p-3">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-redline text-[9px] font-bold text-white">
          PDF
        </span>
        <span className="truncate font-mono text-[11px] text-ink">{filename}.pdf</span>
      </div>
      <p className="mt-1 text-[11px] text-ink-soft">{approxSizeLabel(content)}</p>

      {error && <p className="mt-2 text-[11px] text-redline">{error}</p>}

      <div className="mt-3 flex gap-2">
        <button
          onClick={handleDownloadPdf}
          disabled={generating !== null}
          className="flex-1 rounded-md bg-navy-light px-2 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-navy disabled:cursor-not-allowed disabled:opacity-60"
        >
          {generating === 'pdf' ? '…' : t('miniFileCard.downloadPdf')}
        </button>
        <button
          onClick={handleDownloadWord}
          disabled={generating !== null}
          className="flex-1 rounded-md border border-navy-light px-2 py-1.5 text-[11px] font-medium text-navy-light transition-colors hover:bg-navy-light/5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {generating === 'word' ? '…' : t('miniFileCard.downloadWord')}
        </button>
      </div>
    </div>
  );
}
