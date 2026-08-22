'use client';

import { useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { parsePageRanges, everyPageIndividually, type PageRange } from '@/lib/pageRanges';
import { usePendingToolFile } from '@/lib/usePendingToolFile';
import { useLocale } from '@/lib/i18n/LocaleContext';
import { recordClientOperation } from '@/lib/statsApi';
import { startJob, completeJob, failJob } from '@/lib/activityStore';
import GuestEncouragementBar from './GuestEncouragementBar';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SplitPdf() {
  const { t } = useLocale();
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [mode, setMode] = useState<'ranges' | 'each'>('ranges');
  const [rangesInput, setRangesInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  usePendingToolFile(handleFileSelect);

  async function handleFileSelect(selected: File) {
    setError(null);
    setFile(null);
    setPageCount(null);
    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setError(t('dashboard.selectPdfError'));
      return;
    }
    try {
      const bytes = await selected.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      setFile(selected);
      setPageCount(doc.getPageCount());
    } catch {
      setError(t('toolPage.split.couldNotRead'));
    }
  }

  async function handleSplit() {
    if (!file || !pageCount) return;
    setError(null);
    setIsProcessing(true);
    // Not started until the final filename is known (single output vs. a
    // zip) — this one genuinely can't name the job up front like the other
    // tools, since split's output shape depends on how many ranges result.
    let jobId: string | null = null;
    try {
      let ranges: PageRange[];
      if (mode === 'each') {
        ranges = everyPageIndividually(pageCount);
      } else {
        ranges = parsePageRanges(rangesInput, pageCount);
      }

      const sourceBytes = await file.arrayBuffer();
      const baseName = file.name.replace(/\.pdf$/i, '');

      const outputs: { name: string; bytes: Uint8Array }[] = [];
      for (const range of ranges) {
        const sourceDoc = await PDFDocument.load(sourceBytes);
        const outDoc = await PDFDocument.create();
        const pages = await outDoc.copyPages(sourceDoc, range.pages);
        pages.forEach((p) => outDoc.addPage(p));
        outputs.push({ name: `${baseName}-${range.label}.pdf`, bytes: await outDoc.save() });
      }

      if (outputs.length === 1) {
        jobId = startJob(outputs[0].name);
        downloadBlob(
          new Blob([outputs[0].bytes.buffer as ArrayBuffer], { type: 'application/pdf' }),
          outputs[0].name
        );
      } else {
        const zipName = `${baseName}-split.zip`;
        jobId = startJob(zipName);
        const zip = new JSZip();
        outputs.forEach((o) => zip.file(o.name, o.bytes));
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(zipBlob, zipName);
      }
      recordClientOperation('split');
      completeJob(jobId);
      setCompleted(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('toolPage.split.couldNotSplit');
      if (jobId) failJob(jobId, message);
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">{t('tool.split.name')}</h1>
      <p className="mt-2 text-gray-600">
        {t('toolPage.split.description')}
      </p>

      <div
        onClick={() => inputRef.current?.click()}
        className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-12 text-center"
      >
        <p className="text-gray-600">
          {file ? t('toolPage.split.fileWithPageCount').replace('{name}', file.name).replace('{n}', String(pageCount)) : t('aiTool.clickToChoosePdf')}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {file && pageCount && (
        <div className="mt-6 space-y-4 rounded-lg border border-gray-200 bg-white p-4">
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={mode === 'ranges'}
                onChange={() => setMode('ranges')}
              />
              {t('toolPage.split.pageRanges')}
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={mode === 'each'} onChange={() => setMode('each')} />
              {t('toolPage.split.everyPageIndividually')}
            </label>
          </div>

          {mode === 'ranges' && (
            <input
              type="text"
              value={rangesInput}
              onChange={(e) => setRangesInput(e.target.value)}
              placeholder={t('toolPage.split.rangesPlaceholder').replace('{n}', String(pageCount))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          )}
        </div>
      )}

      <button
        onClick={handleSplit}
        disabled={!file || isProcessing || (mode === 'ranges' && rangesInput.trim() === '')}
        className="mt-6 w-full rounded-lg bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isProcessing ? t('toolPage.split.splitting') : t('toolPage.split.splitAndDownload')}
      </button>

      {completed && <GuestEncouragementBar />}
    </div>
  );
}
