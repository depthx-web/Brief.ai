'use client';

import { useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { usePendingToolFile } from '@/lib/usePendingToolFile';

// Served as a static asset (see scripts/copy-pdf-worker.mjs) rather than bundled,
// since Next's production minifier chokes on the worker's ESM syntax.
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

const PREVIEW_WIDTH = 500;

interface Placement {
  xPct: number;
  yPct: number;
}

export default function SignPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [selectedPage, setSelectedPage] = useState(1);
  const [pagePreviewUrl, setPagePreviewUrl] = useState<string | null>(null);

  const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw');
  const [signatureSrc, setSignatureSrc] = useState<string | null>(null);
  const [placement, setPlacement] = useState<Placement | null>(null);
  const [signatureWidthPct, setSignatureWidthPct] = useState(0.25);
  const [includeDate, setIncludeDate] = useState(true);

  const [isDrawing, setIsDrawing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const signatureFileInputRef = useRef<HTMLInputElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  usePendingToolFile(handleFileSelect);

  async function renderPagePreview(pdfFile: File, pageNum: number) {
    const bytes = new Uint8Array(await pdfFile.arrayBuffer());
    const pdfDoc = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
    const page = await pdfDoc.getPage(pageNum);
    const pointViewport = page.getViewport({ scale: 1 });
    const viewport = page.getViewport({ scale: PREVIEW_WIDTH / pointViewport.width });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not create a canvas context for rendering.');
    await page.render({ canvasContext: ctx, viewport }).promise;
    await pdfDoc.destroy();
    setPagePreviewUrl(canvas.toDataURL('image/png'));
  }

  async function handleFileSelect(selected: File) {
    setError(null);
    setFile(null);
    setPageCount(null);
    setPagePreviewUrl(null);
    setPlacement(null);
    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file.');
      return;
    }
    try {
      const bytes = await selected.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const count = doc.getPageCount();
      setFile(selected);
      setPageCount(count);
      setSelectedPage(count);
      await renderPagePreview(selected, count);
    } catch {
      setError('Could not read this PDF. It may be corrupted or password-protected.');
    }
  }

  async function handlePageChange(pageNum: number) {
    if (!file || !pageCount) return;
    const clamped = Math.min(Math.max(1, pageNum), pageCount);
    setSelectedPage(clamped);
    setPlacement(null);
    try {
      await renderPagePreview(file, clamped);
    } catch {
      setError('Could not render this page.');
    }
  }

  function getCanvasPoint(e: ReactPointerEvent<HTMLCanvasElement>) {
    const canvas = drawCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function handleDrawStart(e: ReactPointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    const point = getCanvasPoint(e);
    if (!point) return;
    setIsDrawing(true);
    lastPointRef.current = point;
  }

  function handleDrawMove(e: ReactPointerEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    const point = getCanvasPoint(e);
    if (!canvas || !ctx || !point || !lastPointRef.current) return;
    ctx.strokeStyle = '#1a202c';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPointRef.current = point;
  }

  function handleDrawEnd() {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPointRef.current = null;
    const canvas = drawCanvasRef.current;
    if (canvas) setSignatureSrc(canvas.toDataURL('image/png'));
  }

  function clearDrawing() {
    const canvas = drawCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureSrc(null);
    setPlacement(null);
  }

  function handleSignatureUpload(selected: File) {
    if (selected.type !== 'image/png' && selected.type !== 'image/jpeg') {
      setError('Please upload a PNG or JPEG image.');
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setSignatureSrc(reader.result as string);
      setPlacement(null);
    };
    reader.readAsDataURL(selected);
  }

  function handlePreviewClick(e: ReactMouseEvent<HTMLDivElement>) {
    if (!signatureSrc) {
      setError('Draw or upload a signature first.');
      return;
    }
    setError(null);
    const rect = e.currentTarget.getBoundingClientRect();
    setPlacement({
      xPct: (e.clientX - rect.left) / rect.width,
      yPct: (e.clientY - rect.top) / rect.height,
    });
  }

  async function handleDownload() {
    if (!file || !signatureSrc || !placement) return;
    setError(null);
    setIsProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const page = doc.getPages()[selectedPage - 1];
      const { width: pageWidth, height: pageHeight } = page.getSize();

      const isPng = signatureSrc.startsWith('data:image/png');
      const imgBytes = await (await fetch(signatureSrc)).arrayBuffer();
      const image = isPng ? await doc.embedPng(imgBytes) : await doc.embedJpg(imgBytes);

      const drawWidth = pageWidth * signatureWidthPct;
      const drawHeight = drawWidth * (image.height / image.width);
      const x = Math.min(Math.max(0, placement.xPct * pageWidth - drawWidth / 2), pageWidth - drawWidth);
      const y = Math.min(
        Math.max(0, pageHeight - placement.yPct * pageHeight - drawHeight / 2),
        pageHeight - drawHeight
      );

      page.drawImage(image, { x, y, width: drawWidth, height: drawHeight });

      if (includeDate) {
        const font = await doc.embedFont(StandardFonts.Helvetica);
        const fontSize = 9;
        page.drawText(new Date().toLocaleDateString(), {
          x,
          y: Math.max(0, y - fontSize - 2),
          size: fontSize,
          font,
          color: rgb(0.4, 0.4, 0.4),
        });
      }

      const outBytes = await doc.save();
      const blob = new Blob([outBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '') + '-signed.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign this PDF.');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">Sign PDF</h1>
      <p className="mt-2 text-gray-600">
        Draw or upload a signature, click to place it on a page, and optionally stamp the date.
        Processed entirely in your browser.
      </p>

      <div
        onClick={() => fileInputRef.current?.click()}
        className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-12 text-center"
      >
        <p className="text-gray-600">
          {file ? `${file.name} (${pageCount} pages)` : 'Click to choose a PDF file'}
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {file && pageCount && (
        <>
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex gap-4 text-sm">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={signatureMode === 'draw'}
                  onChange={() => setSignatureMode('draw')}
                />
                Draw
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={signatureMode === 'upload'}
                  onChange={() => setSignatureMode('upload')}
                />
                Upload image
              </label>
            </div>

            {signatureMode === 'draw' ? (
              <div className="mt-3">
                {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
                <canvas
                  ref={drawCanvasRef}
                  width={400}
                  height={150}
                  style={{ touchAction: 'none' }}
                  className="rounded border border-gray-300 bg-white"
                  onPointerDown={handleDrawStart}
                  onPointerMove={handleDrawMove}
                  onPointerUp={handleDrawEnd}
                />
                <div className="mt-2">
                  <button
                    onClick={clearDrawing}
                    className="text-sm text-gray-500 hover:text-red-600"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <button
                  onClick={() => signatureFileInputRef.current?.click()}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  Choose image
                </button>
                <input
                  ref={signatureFileInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleSignatureUpload(e.target.files[0])}
                />
                {signatureSrc && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={signatureSrc} alt="Signature preview" className="mt-3 h-16" />
                )}
              </div>
            )}
          </div>

          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-3 text-sm">
              <label htmlFor="sign-page">Page</label>
              <input
                id="sign-page"
                type="number"
                min={1}
                max={pageCount}
                value={selectedPage}
                onChange={(e) => handlePageChange(Number(e.target.value))}
                className="w-20 rounded-md border border-gray-300 px-2 py-1"
              />
              <span className="text-gray-400">of {pageCount}</span>
            </div>

            <div className="mt-3">
              <label className="block text-sm text-gray-700">Signature size</label>
              <input
                type="range"
                min={0.1}
                max={0.4}
                step={0.01}
                value={signatureWidthPct}
                onChange={(e) => setSignatureWidthPct(Number(e.target.value))}
                className="mt-1 w-full"
              />
            </div>

            <label className="mt-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={includeDate}
                onChange={(e) => setIncludeDate(e.target.checked)}
              />
              Add today&apos;s date below the signature
            </label>

            {pagePreviewUrl && (
              <div className="mt-4">
                <p className="text-xs text-gray-400">Click on the page to place your signature.</p>
                <div
                  onClick={handlePreviewClick}
                  className="relative mt-2 cursor-crosshair overflow-hidden rounded border border-gray-300"
                  style={{ width: PREVIEW_WIDTH }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={pagePreviewUrl}
                    alt={`Page ${selectedPage} preview`}
                    className="block w-full"
                  />
                  {placement && signatureSrc && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={signatureSrc}
                      alt="Signature placement"
                      className="pointer-events-none absolute"
                      style={{
                        left: `${placement.xPct * 100}%`,
                        top: `${placement.yPct * 100}%`,
                        width: `${signatureWidthPct * 100}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <button
        onClick={handleDownload}
        disabled={!file || !signatureSrc || !placement || isProcessing}
        className="mt-6 w-full rounded-lg bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isProcessing ? 'Signing…' : 'Sign & Download'}
      </button>
    </div>
  );
}
