import * as pdfjsLib from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import { createWorker } from 'tesseract.js';

// Served as a static asset (see scripts/copy-pdf-worker.mjs) rather than bundled,
// since Next's production minifier chokes on the worker's ESM syntax.
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const OCR_FALLBACK_DPI = 200;

export interface PageText {
  page: number;
  text: string;
}

export async function extractPdfText(file: File): Promise<PageText[]> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdfDoc = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
  const pages: PageText[] = [];

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .filter((item): item is TextItem => 'str' in item)
      .map((item) => item.str)
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
    pages.push({ page: i, text });
  }

  await pdfDoc.destroy();
  return pages;
}

export function isLikelyScanned(pages: PageText[]): boolean {
  const totalChars = pages.reduce((sum, p) => sum + p.text.length, 0);
  const avgCharsPerPage = pages.length ? totalChars / pages.length : 0;
  return avgCharsPerPage < 20;
}

/**
 * Extracts text normally; if the result looks like a scanned document
 * (little/no embedded text), falls back to running OCR page-by-page for
 * plain text only (no searchable-PDF reconstruction — see /ocr for that).
 */
export async function extractPdfTextWithOcrFallback(
  file: File,
  language: string = 'eng',
  onStatus?: (status: string) => void
): Promise<{ pages: PageText[]; usedOcr: boolean }> {
  const directPages = await extractPdfText(file);
  if (!isLikelyScanned(directPages)) {
    return { pages: directPages, usedOcr: false };
  }

  onStatus?.('Document looks scanned — running OCR…');
  const worker = await createWorker(language, 1, {
    workerPath: '/tesseract/worker.min.js',
    corePath: '/tesseract/tesseract-core-simd-lstm.wasm.js',
  });

  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const pdfDoc = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
    const pages: PageText[] = [];
    const renderScale = OCR_FALLBACK_DPI / 72;

    for (let i = 1; i <= pdfDoc.numPages; i++) {
      onStatus?.(`OCR — page ${i} of ${pdfDoc.numPages}…`);
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: renderScale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not create a canvas context for rendering.');
      await page.render({ canvasContext: ctx, viewport }).promise;

      const { data } = await worker.recognize(canvas);
      pages.push({ page: i, text: data.text.trim() });
    }

    await pdfDoc.destroy();
    return { pages, usedOcr: true };
  } finally {
    await worker.terminate();
  }
}
