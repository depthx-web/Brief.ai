'use client';

import { useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { loadPdfForPreview, renderAllThumbnails, renderPageDataUrl } from '@/lib/pdfThumbnails';
import { usePendingToolFile } from '@/lib/usePendingToolFile';
import PageThumbnailStrip, { type ThumbnailPage } from './PageThumbnailStrip';

interface PageItem {
  id: string;
  originalIndex: number;
  keep: boolean;
  thumbnailUrl: string;
}

export default function OrganizePdf() {
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
        keep: true,
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

  function toggleKeep(id: string) {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, keep: !p.keep } : p)));
  }

  function handleReorder(next: ThumbnailPage[]) {
    setPages(
      next.map((t) => pages.find((p) => p.id === t.id)!).filter(Boolean)
    );
  }

  async function handleDownload() {
    if (!file) return;
    setError(null);
    setIsProcessing(true);
    try {
      const kept = pages.filter((p) => p.keep);
      const bytes = await file.arrayBuffer();
      const sourceDoc = await PDFDocument.load(bytes);
      const outDoc = await PDFDocument.create();
      const copied = await outDoc.copyPages(
        sourceDoc,
        kept.map((p) => p.originalIndex)
      );
      copied.forEach((p) => outDoc.addPage(p));
      const outBytes = await outDoc.save();
      const blob = new Blob([outBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '') + '-organized.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save this PDF.');
    } finally {
      setIsProcessing(false);
    }
  }

  const keptCount = pages.filter((p) => p.keep).length;
  const selectedPage = pages.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">Organize PDF</h1>
      <p className="mt-2 text-gray-600">
        Reorder or delete pages within a single PDF. Processed entirely in your browser.
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
            pages={pages.map((p) => ({ id: p.id, originalIndex: p.originalIndex, thumbnailUrl: p.thumbnailUrl, dimmed: !p.keep }))}
            selectedId={selectedId}
            onSelect={handleSelect}
            onReorder={handleReorder}
          />
          <div className="flex flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <span className="text-sm text-ink-soft">
                Page {selectedPage ? selectedPage.originalIndex + 1 : '—'} of {pages.length}
              </span>
              {selectedPage && (
                <label className="flex items-center gap-2 text-sm text-ink">
                  <input type="checkbox" checked={selectedPage.keep} onChange={() => toggleKeep(selectedPage.id)} />
                  Keep this page
                </label>
              )}
            </div>
            <div className="flex flex-1 items-center justify-center overflow-auto bg-surface p-6">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Selected page preview"
                  className={`max-h-full rounded shadow-level-2 ${selectedPage && !selectedPage.keep ? 'opacity-40' : ''}`}
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
        disabled={!file || isProcessing || keptCount === 0}
        className="mt-6 w-full rounded-lg bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isProcessing ? 'Saving…' : `Save ${keptCount || ''} Pages & Download`}
      </button>
    </div>
  );
}
