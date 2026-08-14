'use client';

import { useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import JSZip from 'jszip';

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
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<Format>('png');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(selected: File) {
    setError(null);
    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file.');
      return;
    }
    setFile(selected);
  }

  async function handleConvert() {
    if (!file) return;
    setError(null);
    setIsProcessing(true);
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
        if (!ctx) throw new Error('Could not create a canvas context for rendering.');

        await page.render({ canvasContext: ctx, viewport }).promise;

        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error('Failed to encode page as an image.'))),
            mime,
            0.85
          );
        });
        images.push({ name: `${baseName}-page-${i}.${ext}`, blob });
      }
      await pdfDoc.destroy();

      if (images.length === 1) {
        downloadBlob(images[0].blob, images[0].name);
      } else {
        const zip = new JSZip();
        for (const img of images) zip.file(img.name, img.blob);
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(zipBlob, `${baseName}-images.zip`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not convert this PDF.');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">PDF to Images</h1>
      <p className="mt-2 text-gray-600">
        Export every page as an image. Processed entirely in your browser.
      </p>

      <div
        onClick={() => inputRef.current?.click()}
        className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-12 text-center"
      >
        <p className="text-gray-600">{file ? file.name : 'Click to choose a PDF file'}</p>
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
            PNG (lossless)
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" checked={format === 'jpeg'} onChange={() => setFormat('jpeg')} />
            JPEG (smaller)
          </label>
        </div>
      )}

      <button
        onClick={handleConvert}
        disabled={!file || isProcessing}
        className="mt-6 w-full rounded-lg bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isProcessing ? 'Converting…' : 'Convert & Download'}
      </button>
    </div>
  );
}
