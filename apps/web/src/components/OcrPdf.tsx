'use client';

import { useRef, useState } from 'react';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';

// Served as a static asset (see scripts/copy-pdf-worker.mjs) rather than bundled,
// since Next's production minifier chokes on the worker's ESM syntax.
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const OCR_DPI = 200;
const MIN_CONFIDENCE = 20;

type Language = 'eng' | 'fra' | 'ara' | 'spa';

const LANGUAGES: Record<Language, string> = {
  eng: 'English',
  fra: 'French',
  ara: 'Arabic',
  spa: 'Spanish',
};

export default function OcrPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [language, setLanguage] = useState<Language>('eng');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
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

  async function handleRunOcr() {
    if (!file) return;
    setError(null);
    setIsProcessing(true);
    setStatus('Starting OCR engine…');

    const worker = await createWorker(language, 1, {
      workerPath: '/tesseract/worker.min.js',
      corePath: '/tesseract/tesseract-core-simd-lstm.wasm.js',
      logger: (m) => {
        setStatus(`${m.status} (${Math.round(m.progress * 100)}%)`);
      },
    });

    try {
      const srcBytes = new Uint8Array(await file.arrayBuffer());
      const pdfDoc = await pdfjsLib.getDocument({ data: srcBytes.slice() }).promise;
      const outDoc = await PDFDocument.create();
      const font = await outDoc.embedFont(StandardFonts.Helvetica);
      const renderScale = OCR_DPI / 72;

      for (let i = 1; i <= pdfDoc.numPages; i++) {
        setStatus(`Page ${i} of ${pdfDoc.numPages} — rendering…`);
        const page = await pdfDoc.getPage(i);
        const pointViewport = page.getViewport({ scale: 1 });
        const renderViewport = page.getViewport({ scale: renderScale });

        const canvas = document.createElement('canvas');
        canvas.width = Math.round(renderViewport.width);
        canvas.height = Math.round(renderViewport.height);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not create a canvas context for rendering.');
        await page.render({ canvasContext: ctx, viewport: renderViewport }).promise;

        setStatus(`Page ${i} of ${pdfDoc.numPages} — recognizing text…`);
        const { data } = await worker.recognize(canvas);

        const imgBytes = await new Promise<Uint8Array>((resolve, reject) => {
          canvas.toBlob(async (blob) => {
            if (!blob) {
              reject(new Error('Failed to encode page as an image.'));
              return;
            }
            resolve(new Uint8Array(await blob.arrayBuffer()));
          }, 'image/jpeg', 0.85);
        });
        const jpgImage = await outDoc.embedJpg(imgBytes);

        const outPage = outDoc.addPage([pointViewport.width, pointViewport.height]);
        outPage.drawImage(jpgImage, {
          x: 0,
          y: 0,
          width: pointViewport.width,
          height: pointViewport.height,
        });

        for (const word of data.words) {
          const text = word.text.trim();
          if (!text || word.confidence < MIN_CONFIDENCE) continue;
          const { x0, y0, y1 } = word.bbox;
          const wordHeightPt = (y1 - y0) / renderScale;
          outPage.drawText(text, {
            x: x0 / renderScale,
            y: pointViewport.height - y1 / renderScale,
            size: Math.max(1, wordHeightPt * 0.85),
            font,
            opacity: 0,
          });
        }
      }

      await pdfDoc.destroy();
      setStatus('Saving…');
      const outBytes = await outDoc.save();
      const blob = new Blob([outBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '') + '-ocr.pdf';
      a.click();
      URL.revokeObjectURL(url);
      setStatus(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not run OCR on this PDF.');
    } finally {
      await worker.terminate();
      setIsProcessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">OCR — Make PDF Searchable</h1>
      <p className="mt-2 text-gray-600">
        Recognize text in a scanned PDF and add an invisible, searchable/selectable text layer on
        top of the original page images. Processed entirely in your browser.
      </p>
      <p className="mt-1 text-xs text-gray-400">
        The recognition engine runs locally via WebAssembly; your file never leaves the browser.
        Language data (a few MB) is downloaded once from a public CDN the first time you use a
        given language.
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
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
          <label className="block text-sm font-medium text-gray-700">Document language</label>
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            {(Object.keys(LANGUAGES) as Language[]).map((key) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={language === key}
                  onChange={() => setLanguage(key)}
                  disabled={isProcessing}
                />
                {LANGUAGES[key]}
              </label>
            ))}
          </div>
        </div>
      )}

      {status && <p className="mt-4 text-sm text-gray-500">{status}</p>}

      <button
        onClick={handleRunOcr}
        disabled={!file || isProcessing}
        className="mt-6 w-full rounded-lg bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isProcessing ? 'Running OCR…' : 'Run OCR & Download'}
      </button>
    </div>
  );
}
