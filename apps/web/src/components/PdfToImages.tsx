'use client';

import { useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';
import { usePendingToolFile } from '@/lib/usePendingToolFile';
import { useLocale } from '@/lib/i18n/LocaleContext';
import { recordClientOperation } from '@/lib/statsApi';
import { startJob, completeJob, failJob } from '@/lib/activityStore';
import GuestEncouragementBar from './GuestEncouragementBar';

// Served as a static asset (see scripts/copy-pdf-worker.mjs) rather than bundled,
// since Next's production minifier chokes on the worker's ESM syntax.
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

type Format = 'png' | 'jpeg';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function PdfToImages() {
  const { t } = useLocale();
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<Format>('png');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  usePendingToolFile(handleFileSelect);

  async function handleFileSelect(selected: File) {
    setError(null);
    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setError(t('dashboard.selectPdfError'));
      return;
    }
    setFile(selected);
  }

  async function handleConvert() {
    if (!file) return;
    setError(null);
    setIsProcessing(true);
    // Not started until the final filename is known (single image vs. a
    // zip) — depends on the page count, only known once the PDF is loaded.
    let jobId: string | null = null;
    try {
      const srcBytes = new Uint8Array(await file.arrayBuffer());
      const pdfDoc = await pdfjsLib.getDocument({ data: srcBytes.slice() }).promise;
      const baseName = file.name.replace(/\.pdf$/i, '');
      const ext = format === 'png' ? 'png' : 'jpg';
      const mime = format === 'png' ? 'image/png' : 'image/jpeg';

      const images: { name: string; blob: Blob }[] = [];
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale: 150 / 72 });
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(viewport.width);
        canvas.height = Math.round(viewport.height);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error(t('toolPage.pdfToImages.canvasError'));

        await page.render({ canvasContext: ctx, viewport }).promise;

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error(t('toolPage.pdfToImages.encodeError')))),
            mime,
            0.85
          );
        });
        images.push({ name: `${baseName}-page-${i}.${ext}`, blob });
      }
      await pdfDoc.destroy();

      if (images.length === 1) {
        jobId = startJob(images[0].name);
        downloadBlob(images[0].blob, images[0].name);
      } else {
        const zipName = `${baseName}-images.zip`;
        jobId = startJob(zipName);
        const zip = new JSZip();
        for (const img of images) zip.file(img.name, img.blob);
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(zipBlob, zipName);
      }
      recordClientOperation('pdf-to-images');
      completeJob(jobId);
      setCompleted(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('toolPage.pdfToImages.couldNotConvert');
      if (jobId) failJob(jobId, message);
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">{t('tool.pdfToImages.name')}</h1>
      <p className="mt-2 text-gray-600">
        {t('toolPage.pdfToImages.description')}
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

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {file && (
        <div className="mt-6 flex gap-4 rounded-lg border border-gray-200 bg-white p-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="radio" checked={format === 'png'} onChange={() => setFormat('png')} />
            {t('toolPage.pdfToImages.formatPngLossless')}
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={format === 'jpeg'} onChange={() => setFormat('jpeg')} />
            {t('toolPage.pdfToImages.formatJpegSmaller')}
          </label>
        </div>
      )}

      <button
        onClick={handleConvert}
        disabled={!file || isProcessing}
        className="mt-6 w-full rounded-lg bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isProcessing ? t('toolPage.converting') : t('toolPage.pdfToImages.convertAndDownload')}
      </button>

      {completed && <GuestEncouragementBar />}
    </div>
  );
}
