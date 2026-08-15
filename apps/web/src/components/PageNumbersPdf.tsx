'use client';

import { useRef, useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { loadPdfForPreview, renderAllThumbnails, renderPageDataUrl } from '@/lib/pdfThumbnails';
import { usePendingToolFile } from '@/lib/usePendingToolFile';
import PageThumbnailStrip from './PageThumbnailStrip';

type Position = 'bottom-center' | 'bottom-right' | 'top-right';

const POSITIONS: Record<Position, string> = {
  'bottom-center': 'Bottom center',
  'bottom-right': 'Bottom right',
  'top-right': 'Top right',
};

interface PageItem {
  id: string;
  originalIndex: number;
  thumbnailUrl: string;
}

export default function PageNumbersPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [position, setPosition] = useState<Position>('bottom-center');
  const [startAt, setStartAt] = useState(1);
  const [isLoadingThumbs, setIsLoadingThumbs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  usePendingToolFile(handleFileSelect);

  async function handleFileSelect(selected: File) {
    setError(null);
    setFile(null);
    setPages([]);
    setSelectedId(null);
    setPreviewUrl(null);
    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file.');
      return;
    }
    setIsLoadingThumbs(true);
    try {
      const bytes = await selected.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const previewDoc = await loadPdfForPreview(selected);
      const thumbnails = await renderAllThumbnails(previewDoc);
      const items: PageItem[] = Array.from({ length: doc.getPageCount() }, (_, i) => ({
        id: crypto.randomUUID(),
        originalIndex: i,
        thumbnailUrl: thumbnails[i],
      }));
      setFile(selected);
      setPages(items);
      setSelectedId(items[0]?.id ?? null);
      if (items[0]) setPreviewUrl(await renderPageDataUrl(previewDoc, 1, 720));
      await previewDoc.destroy();
    } catch {
      setError('Could not read this PDF. It may be corrupted or password-protected.');
    } finally {
      setIsLoadingThumbs(false);
    }
  }

  async function handleSelect(id: string) {
    setSelectedId(id);
    if (!file) return;
    const index = pages.findIndex((p) => p.id === id);
    if (index === -1) return;
    const previewDoc = await loadPdfForPreview(file);
    setPreviewUrl(await renderPageDataUrl(previewDoc, pages[index].originalIndex + 1, 720));
    await previewDoc.destroy();
  }

  async function handleDownload() {
    if (!file) return;
    setError(null);
    setIsProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const margin = 24;
      const fontSize = 10;

      doc.getPages().forEach((page, i) => {
        const label = String(startAt + i);
        const textWidth = font.widthOfTextAtSize(label, fontSize);
        const { width, height } = page.getSize();

        let x: number;
        let y: number;
        if (position === 'bottom-center') {
          x = width / 2 - textWidth / 2;
          y = margin;
        } else if (position === 'bottom-right') {
          x = width - margin - textWidth;
          y = margin;
        } else {
          x = width - margin - textWidth;
          y = height - margin;
        }

        page.drawText(label, { x, y, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
      });

      const outBytes = await doc.save();
      const blob = new Blob([outBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '') + '-numbered.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not number this PDF.');
    } finally {
      setIsProcessing(false);
    }
  }

  const selectedPage = pages.find((p) => p.id === selectedId) ?? null;
  const previewLabel = selectedPage ? String(startAt + selectedPage.originalIndex) : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">Add Page Numbers</h1>
      <p className="mt-2 text-gray-600">
        Stamp page numbers onto every page. Processed entirely in your browser.
      </p>

      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-12 text-center"
        >
          <p className="text-gray-600">{isLoadingThumbs ? 'Reading pages…' : 'Click to choose a PDF file'}</p>
        </div>
      ) : (
        <div className="mt-6 flex h-[560px] overflow-hidden rounded-lg border border-gray-200 bg-white">
          <PageThumbnailStrip pages={pages} selectedId={selectedId} onSelect={handleSelect} />
          <div className="flex flex-1 flex-col">
            <div className="flex flex-wrap items-center gap-5 border-b border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-ink-soft">Position</label>
                {(Object.keys(POSITIONS) as Position[]).map((key) => (
                  <label key={key} className="flex items-center gap-1.5 text-xs text-ink">
                    <input type="radio" checked={position === key} onChange={() => setPosition(key)} />
                    {POSITIONS[key]}
                  </label>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-ink-soft">Start at</label>
                <input
                  type="number"
                  min={0}
                  value={startAt}
                  onChange={(e) => setStartAt(Number(e.target.value))}
                  className="w-16 rounded-md border border-gray-300 px-2 py-1 text-xs"
                />
              </div>
            </div>
            <div className="relative flex flex-1 items-center justify-center overflow-auto bg-surface p-6">
              {previewUrl && (
                <div className="relative inline-block">
                  <img src={previewUrl} alt="Selected page preview" className="max-h-full rounded shadow-level-2" />
                  {previewLabel && (
                    <span
                      className={`absolute rounded bg-navy/80 px-1.5 py-0.5 font-mono text-[10px] text-white ${
                        position === 'bottom-center'
                          ? 'bottom-2 left-1/2 -translate-x-1/2'
                          : position === 'bottom-right'
                            ? 'bottom-2 right-2'
                            : 'right-2 top-2'
                      }`}
                    >
                      {previewLabel}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
      />

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        onClick={handleDownload}
        disabled={!file || isProcessing}
        className="mt-6 w-full rounded-lg bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isProcessing ? 'Numbering…' : 'Add Numbers & Download'}
      </button>
    </div>
  );
}
