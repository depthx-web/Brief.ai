'use client';

import { useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';

interface PageItem {
  id: string;
  originalIndex: number;
  keep: boolean;
}

export default function OrganizePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragIndex = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(selected: File) {
    setError(null);
    setFile(null);
    setPages([]);
    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file.');
      return;
    }
    try {
      const bytes = await selected.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      setFile(selected);
      setPages(
        Array.from({ length: doc.getPageCount() }, (_, i) => ({
          id: crypto.randomUUID(),
          originalIndex: i,
          keep: true,
        }))
      );
    } catch {
      setError('Could not read this PDF. It may be corrupted or password-protected.');
    }
  }

  function toggleKeep(id: string) {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, keep: !p.keep } : p)));
  }

  function handleDragStart(index: number) {
    dragIndex.current = index;
  }

  function handleDrop(index: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === index) return;
    setPages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      return next;
    });
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

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">Organize PDF</h1>
      <p className="mt-2 text-gray-600">
        Reorder or delete pages within a single PDF. Processed entirely in your browser.
      </p>

      <div
        onClick={() => inputRef.current?.click()}
        className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-12 text-center"
      >
        <p className="text-gray-600">
          {file ? `${file.name} (${pages.length} pages)` : 'Click to choose a PDF file'}
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

      {pages.length > 0 && (
        <ul className="mt-6 max-h-96 divide-y divide-gray-200 overflow-y-auto rounded-lg border border-gray-200 bg-white">
          {pages.map((page, index) => (
            <li
              key={page.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className={`flex cursor-move items-center justify-between gap-3 px-4 py-3 ${
                page.keep ? '' : 'opacity-40'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-400">⠿</span>
                <span className="text-sm font-medium text-gray-800">
                  Page {page.originalIndex + 1}
                </span>
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-500">
                <input type="checkbox" checked={page.keep} onChange={() => toggleKeep(page.id)} />
                Keep
              </label>
            </li>
          ))}
        </ul>
      )}

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
