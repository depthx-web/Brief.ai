'use client';

import { useRef, useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';
import { loadPdfForPreview, renderAllThumbnails, renderPageDataUrl } from '@/lib/pdfThumbnails';
import { usePendingToolFile } from '@/lib/usePendingToolFile';
import PageThumbnailStrip from './PageThumbnailStrip';

interface PageItem {
  id: string;
  originalIndex: number;
  thumbnailUrl: string;
  rotation: number; // 0, 90, 180, 270 — clockwise delta applied on top of the page's own rotation
}

export default function RotatePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
        rotation: 0,
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

  function rotateSelected(delta: number) {
    if (!selectedId) return;
    setPages((prev) =>
      prev.map((p) => (p.id === selectedId ? { ...p, rotation: (p.rotation + delta + 360) % 360 } : p))
    );
  }

  function rotateAll(delta: number) {
    setPages((prev) => prev.map((p) => ({ ...p, rotation: (p.rotation + delta + 360) % 360 })));
  }

  async function handleDownload() {
    if (!file) return;
    setError(null);
    setIsProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const docPages = doc.getPages();
      pages.forEach((p) => {
        if (!p.rotation) return;
        const page = docPages[p.originalIndex];
        const current = page.getRotation().angle;
        page.setRotation(degrees((current + p.rotation) % 360));
      });
      const outBytes = await doc.save();
      const blob = new Blob([outBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '') + '-rotated.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not rotate this PDF.');
    } finally {
      setIsProcessing(false);
    }
  }

  const selectedPage = pages.find((p) => p.id === selectedId) ?? null;
  const anyRotated = pages.some((p) => p.rotation !== 0);

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">Rotate PDF</h1>
      <p className="mt-2 text-gray-600">
        Rotate individual pages or the whole file. Processed entirely in your browser.
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
          <PageThumbnailStrip
            pages={pages.map((p) => ({ id: p.id, originalIndex: p.originalIndex, thumbnailUrl: p.thumbnailUrl, rotationDeg: p.rotation }))}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
          <div className="flex flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <span className="text-sm text-ink-soft">
                Page {selectedPage ? selectedPage.originalIndex + 1 : '—'} of {pages.length}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => rotateSelected(-90)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                  aria-label="Rotate this page counter-clockwise"
                >
                  ↺ This page
                </button>
                <button
                  onClick={() => rotateSelected(90)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                  aria-label="Rotate this page clockwise"
                >
                  ↻ This page
                </button>
                <span className="text-ink-soft/40">|</span>
                <button
                  onClick={() => rotateAll(90)}
                  className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                >
                  Rotate all 90°
                </button>
              </div>
            </div>
            <div className="flex flex-1 items-center justify-center overflow-auto bg-surface p-6">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Selected page preview"
                  style={selectedPage?.rotation ? { transform: `rotate(${selectedPage.rotation}deg)` } : undefined}
                  className="max-h-full rounded shadow-level-2 transition-transform"
                />
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
        disabled={!file || isProcessing || !anyRotated}
        className="mt-6 w-full rounded-lg bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isProcessing ? 'Rotating…' : 'Rotate & Download'}
      </button>
    </div>
  );
}
