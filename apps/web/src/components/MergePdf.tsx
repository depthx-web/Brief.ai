'use client';

import { useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { useLocale } from '@/lib/i18n/LocaleContext';
import { isTauri } from '@/lib/platform';
import { pickPdfFilesNative } from '@/lib/nativeFilePicker';
import GuestEncouragementBar from './GuestEncouragementBar';

interface PdfItem {
  id: string;
  file: File;
}

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function MergePdf() {
  const { t } = useLocale();
  const [items, setItems] = useState<PdfItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(fileList: FileList | File[]) {
    const pdfFiles = Array.from(fileList).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    if (pdfFiles.length === 0) {
      setError(t('toolPage.merge.selectPdfsError'));
      return;
    }
    setError(null);
    setItems((prev) => [
      ...prev,
      ...pdfFiles.map((file) => ({ id: `${file.name}-${file.size}-${crypto.randomUUID()}`, file })),
    ]);
  }

  async function handleChooseFiles() {
    if (isTauri()) {
      const files = await pickPdfFilesNative();
      if (files.length) addFiles(files);
      return;
    }
    inputRef.current?.click();
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleReorderDragStart(index: number) {
    dragIndex.current = index;
  }

  function handleReorderDrop(index: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === index) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      return next;
    });
  }

  async function handleMerge() {
    setError(null);
    setIsMerging(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const item of items) {
        const bytes = await item.file.arrayBuffer();
        const donor = await PDFDocument.load(bytes);
        const pages = await mergedPdf.copyPages(donor, donor.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedBytes = await mergedPdf.save();
      const blob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged.pdf';
      a.click();
      URL.revokeObjectURL(url);
      setCompleted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? t('toolPage.merge.couldNotMergeWithMessage').replace('{message}', err.message)
          : t('toolPage.merge.couldNotMerge')
      );
    } finally {
      setIsMerging(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">{t('tool.merge.name')}</h1>
      <p className="mt-2 text-gray-600">
        {t('toolPage.merge.description')}
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={handleChooseFiles}
        className={`mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors ${
          isDragOver ? 'border-emerald bg-emerald/5' : 'border-gray-300 bg-white'
        }`}
      >
        <p className="text-gray-600">{t('toolPage.merge.dropzone')}</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {items.length > 0 && (
        <ul className="mt-6 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {items.map((item, index) => (
            <li
              key={item.id}
              draggable
              onDragStart={() => handleReorderDragStart(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleReorderDrop(index)}
              className="flex cursor-move items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="text-gray-400">⠿</span>
                <span className="truncate text-sm font-medium text-gray-800">{item.file.name}</span>
                <span className="shrink-0 text-xs text-gray-400">{formatSize(item.file.size)}</span>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="shrink-0 text-sm text-gray-400 hover:text-red-600"
                aria-label={t('toolPage.imagesToPdf.removeAriaLabel').replace('{name}', item.file.name)}
              >
                {t('toolPage.imagesToPdf.remove')}
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={handleMerge}
        disabled={items.length < 2 || isMerging}
        className="mt-6 w-full rounded-lg bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isMerging ? t('toolPage.merge.merging') : t('toolPage.merge.mergeAndDownload').replace('{n}', String(items.length || ''))}
      </button>

      {completed && <GuestEncouragementBar />}
    </div>
  );
}
