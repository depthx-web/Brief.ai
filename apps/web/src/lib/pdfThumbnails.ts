import * as pdfjsLib from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';

// Served as a static asset (see scripts/copy-pdf-worker.mjs) rather than bundled,
// since Next's production minifier chokes on the worker's ESM syntax.
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

export async function loadPdfForPreview(file: File): Promise<PDFDocumentProxy> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  return pdfjsLib.getDocument({ data: bytes }).promise;
}

export async function renderPageDataUrl(
  pdfDoc: PDFDocumentProxy,
  pageNum: number,
  targetWidth: number
): Promise<string> {
  const page = await pdfDoc.getPage(pageNum);
  const pointViewport = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: targetWidth / pointViewport.width });
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(viewport.width);
  canvas.height = Math.round(viewport.height);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create a canvas context for rendering.');
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL('image/png');
}

const THUMBNAIL_WIDTH = 150;

export async function renderAllThumbnails(pdfDoc: PDFDocumentProxy): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    urls.push(await renderPageDataUrl(pdfDoc, i, THUMBNAIL_WIDTH));
  }
  return urls;
}
