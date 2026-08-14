'use client';

import { useRef, useState } from 'react';
import { PDFDocument, degrees } from 'pdf-lib';

export default function RotatePdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [delta, setDelta] = useState(0); // 0, 90, 180, 270 — clockwise
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(selected: File) {
    setError(null);
    setFile(null);
    setPageCount(null);
    setDelta(0);
    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file.');
      return;
    }
    try {
      const bytes = await selected.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      setFile(selected);
      setPageCount(doc.getPageCount());
    } catch {
      setError('Could not read this PDF. It may be corrupted or password-protected.');
    }
  }

  async function handleDownload() {
    if (!file) return;
    setError(null);
    setIsProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      doc.getPages().forEach((page) => {
        const current = page.getRotation().angle;
        page.setRotation(degrees((current + delta) % 360));
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

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">Rotate PDF</h1>
      <p className="mt-2 text-gray-600">
        Rotate every page in a PDF. Processed entirely in your browser.
      </p>

      <div
        onClick={() => inputRef.current?.click()}
        className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-12 text-center"
      >
        <p className="text-gray-600">
          {file ? `${file.name} (${pageCount} pages)` : 'Click to choose a PDF file'}
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

      {file && (
        <div className="mt-6 flex items-center justify-center gap-6 rounded-lg border border-gray-200 bg-white p-6">
          <button
            onClick={() => setDelta((d) => (d + 270) % 360)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            aria-label="Rotate counter-clockwise"
          >
            ↺ Rotate left
          </button>
          <span className="text-sm text-gray-500">{delta}°</span>
          <button
            onClick={() => setDelta((d) => (d + 90) % 360)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50"
            aria-label="Rotate clockwise"
          >
            ↻ Rotate right
          </button>
        </div>
      )}

      <button
        onClick={handleDownload}
        disabled={!file || isProcessing || delta === 0}
        className="mt-6 w-full rounded-lg bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isProcessing ? 'Rotating…' : 'Rotate & Download'}
      </button>
    </div>
  );
}
