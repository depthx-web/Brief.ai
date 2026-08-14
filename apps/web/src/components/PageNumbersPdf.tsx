'use client';

import { useRef, useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

type Position = 'bottom-center' | 'bottom-right' | 'top-right';

const POSITIONS: Record<Position, string> = {
  'bottom-center': 'Bottom center',
  'bottom-right': 'Bottom right',
  'top-right': 'Top right',
};

export default function PageNumbersPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [position, setPosition] = useState<Position>('bottom-center');
  const [startAt, setStartAt] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(selected: File) {
    setError(null);
    setFile(null);
    setPageCount(null);
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

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">Add Page Numbers</h1>
      <p className="mt-2 text-gray-600">
        Stamp page numbers onto every page. Processed entirely in your browser.
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
        <div className="mt-6 space-y-4 rounded-lg border border-gray-200 bg-white p-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Position</label>
            <div className="mt-2 flex gap-4 text-sm">
              {(Object.keys(POSITIONS) as Position[]).map((key) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={position === key}
                    onChange={() => setPosition(key)}
                  />
                  {POSITIONS[key]}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start at</label>
            <input
              type="number"
              min={0}
              value={startAt}
              onChange={(e) => setStartAt(Number(e.target.value))}
              className="mt-2 w-24 rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      )}

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
