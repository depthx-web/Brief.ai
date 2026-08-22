'use client';

import { useRef, useState } from 'react';
import { extractPdfTextWithOcrFallback, type PageText } from '@/lib/extractPdfText';
import { usePendingToolFile } from '@/lib/usePendingToolFile';
import { useLocale } from '@/lib/i18n/LocaleContext';
import { recordClientOperation } from '@/lib/statsApi';
import GuestEncouragementBar from './GuestEncouragementBar';

function toPlainText(pages: PageText[]): string {
  return pages.map((p) => `--- Page ${p.page} ---\n${p.text}`).join('\n\n');
}

export default function PdfToTextPdf() {
  const { t } = useLocale();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  usePendingToolFile(handleFileSelect);

  function handleFileSelect(selected: File) {
    setError(null);
    setCompleted(false);
    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setError(t('dashboard.selectPdfError'));
      return;
    }
    setFile(selected);
  }

  async function handleExtract() {
    if (!file) return;
    setError(null);
    setIsProcessing(true);
    try {
      const { pages } = await extractPdfTextWithOcrFallback(file, 'eng', setStatus);
      const text = toPlainText(pages);
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '') + '.txt';
      a.click();
      URL.revokeObjectURL(url);
      recordClientOperation('pdf-to-text');
      setCompleted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('toolPage.pdfToText.couldNotExtract'));
    } finally {
      setStatus(null);
      setIsProcessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">{t('toolPage.pdfToText.title')}</h1>
      <p className="mt-2 text-gray-600">
        {t('toolPage.pdfToText.description')}
      </p>
      <p className="mt-1 text-xs text-gray-400">
        {t('toolPage.pdfToText.ocrNote')}
      </p>

      <div
        onClick={() => inputRef.current?.click()}
        className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-12 text-center"
      >
        <p className="text-gray-600">{file ? file.name : t('aiTool.clickToChoosePdf')}</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />
      </div>

      {status && <p className="mt-4 text-sm text-gray-500">{status}</p>}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        onClick={handleExtract}
        disabled={!file || isProcessing}
        className="mt-6 w-full rounded-lg bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isProcessing ? t('toolPage.pdfToText.extracting') : t('toolPage.pdfToText.extractAndDownload')}
      </button>

      {completed && <GuestEncouragementBar />}
    </div>
  );
}
