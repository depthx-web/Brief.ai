'use client';

import { useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { usePendingToolFile } from '@/lib/usePendingToolFile';
import { useLocale } from '@/lib/i18n/LocaleContext';
import { recordClientOperation } from '@/lib/statsApi';
import { startJob, completeJob, failJob } from '@/lib/activityStore';
import type { DictionaryKey } from '@/lib/i18n/dictionaries/en';
import GuestEncouragementBar from './GuestEncouragementBar';

// Served as a static asset (see scripts/copy-pdf-worker.mjs) rather than bundled,
// since Next's production minifier chokes on the worker's ESM syntax.
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

type Quality = 'high' | 'medium' | 'low';

const QUALITY_PRESETS: Record<Quality, { dpi: number; jpegQuality: number; labelKey: DictionaryKey }> = {
  high: { dpi: 150, jpegQuality: 0.82, labelKey: 'toolPage.compress.presetHigh' },
  medium: { dpi: 110, jpegQuality: 0.6, labelKey: 'toolPage.compress.presetMedium' },
  low: { dpi: 72, jpegQuality: 0.4, labelKey: 'toolPage.compress.presetLow' },
};

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CompressPdf() {
  const { t } = useLocale();
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<Quality>('medium');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ originalSize: number; newSize: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  usePendingToolFile(handleFileSelect);

  async function handleFileSelect(selected: File) {
    setError(null);
    setResult(null);
    setFile(null);
    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setError(t('dashboard.selectPdfError'));
      return;
    }
    setFile(selected);
  }

  async function handleCompress() {
    if (!file) return;
    setError(null);
    setResult(null);
    setIsProcessing(true);
    const outputFilename = file.name.replace(/\.pdf$/i, '') + '-compressed.pdf';
    const jobId = startJob(outputFilename);
    try {
      const preset = QUALITY_PRESETS[quality];
      const srcBytes = new Uint8Array(await file.arrayBuffer());

      const pdfDoc = await pdfjsLib.getDocument({ data: srcBytes.slice() }).promise;
      const outDoc = await PDFDocument.create();

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const pointViewport = page.getViewport({ scale: 1 });
        const renderViewport = page.getViewport({ scale: preset.dpi / 72 });

        const canvas = document.createElement('canvas');
        canvas.width = Math.round(renderViewport.width);
        canvas.height = Math.round(renderViewport.height);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error(t('toolPage.pdfToImages.canvasError'));

        await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error(t('toolPage.compress.encodeJpegError')))),
            'image/jpeg',
            preset.jpegQuality
          );
        });
        const imgBytes = new Uint8Array(await blob.arrayBuffer());
        const jpgImage = await outDoc.embedJpg(imgBytes);

        const outPage = outDoc.addPage([pointViewport.width, pointViewport.height]);
        outPage.drawImage(jpgImage, {
          x: 0,
          y: 0,
          width: pointViewport.width,
          height: pointViewport.height,
        });
      }
      await pdfDoc.destroy();

      const outBytes = await outDoc.save();
      const outBlob = new Blob([outBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(outBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = outputFilename;
      a.click();
      URL.revokeObjectURL(url);
      recordClientOperation('compress');
      completeJob(jobId);

      setResult({ originalSize: file.size, newSize: outBytes.byteLength });
    } catch (err) {
      const message = err instanceof Error ? err.message : t('toolPage.compress.couldNotCompress');
      failJob(jobId, message);
      setError(message);
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">{t('tool.compress.name')}</h1>
      <p className="mt-2 text-gray-600">
        {t('toolPage.compress.description')}
      </p>
      <p className="mt-1 text-xs text-gray-400">
        {t('toolPage.compress.note')}
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
        <div className="mt-6 flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4">
          {(Object.keys(QUALITY_PRESETS) as Quality[]).map((key) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                checked={quality === key}
                onChange={() => setQuality(key)}
              />
              {t(QUALITY_PRESETS[key].labelKey)}
            </label>
          ))}
        </div>
      )}

      {result && (
        <p className="mt-4 text-sm text-gray-600">
          {formatSize(result.originalSize)} → {formatSize(result.newSize)}
        </p>
      )}

      <button
        onClick={handleCompress}
        disabled={!file || isProcessing}
        className="mt-6 w-full rounded-lg bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isProcessing ? t('toolPage.compress.compressing') : t('toolPage.compress.compressAndDownload')}
      </button>

      {result && <GuestEncouragementBar />}
    </div>
  );
}
