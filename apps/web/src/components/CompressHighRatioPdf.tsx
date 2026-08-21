'use client';

import { useRef, useState } from 'react';
import { compressHighRatio, downloadBlob, type CompressionPreset } from '@/lib/convertApi';
import { usePendingToolFile } from '@/lib/usePendingToolFile';
import { useLocale } from '@/lib/i18n/LocaleContext';
import type { DictionaryKey } from '@/lib/i18n/dictionaries/en';

const PRESETS: { value: CompressionPreset; labelKey: DictionaryKey }[] = [
  { value: 'ebook', labelKey: 'toolPage.compressHighRatio.presetBalanced' },
  { value: 'screen', labelKey: 'toolPage.compressHighRatio.presetSmallest' },
];

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function CompressHighRatioPdf() {
  const { t } = useLocale();
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<CompressionPreset>('ebook');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ originalSize: number; newSize: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  usePendingToolFile(handleFileSelect);

  function handleFileSelect(selected: File) {
    setError(null);
    setResult(null);
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
    try {
      const { blob, filename } = await compressHighRatio(file, preset);
      downloadBlob(blob, filename);
      setResult({ originalSize: file.size, newSize: blob.size });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('toolPage.compress.couldNotCompress'));
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">{t('tool.compressHighRatio.name')}</h1>
      <p className="mt-2 text-gray-600">
        {t('toolPage.compressHighRatio.description')}
      </p>
      <p className="mt-1 text-xs text-gray-400">
        {t('toolPage.compressHighRatio.serverNote')}
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
          {PRESETS.map((p) => (
            <label key={p.value} className="flex items-center gap-2 text-sm">
              <input type="radio" checked={preset === p.value} onChange={() => setPreset(p.value)} />
              {t(p.labelKey)}
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
    </div>
  );
}
