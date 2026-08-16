'use client';

import { useRef, useState } from 'react';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { loadPdfForPreview, renderPageDataUrl } from '@/lib/pdfThumbnails';
import { usePendingToolFile } from '@/lib/usePendingToolFile';
import GuestEncouragementBar from './GuestEncouragementBar';

const DEFAULT_TEXT = 'CONFIDENTIAL';

export default function WatermarkPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [text, setText] = useState(DEFAULT_TEXT);
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(45);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  usePendingToolFile(handleFileSelect);

  async function handleFileSelect(selected: File) {
    setError(null);
    setFile(null);
    setPreviewUrl(null);
    setCompleted(false);
    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file.');
      return;
    }
    setIsLoadingPreview(true);
    try {
      const previewDoc = await loadPdfForPreview(selected);
      setFile(selected);
      setPreviewUrl(await renderPageDataUrl(previewDoc, 1, 480));
      await previewDoc.destroy();
    } catch {
      setError('Could not read this PDF. It may be corrupted or password-protected.');
    } finally {
      setIsLoadingPreview(false);
    }
  }

  async function handleDownload() {
    if (!file || !text.trim()) return;
    setError(null);
    setIsProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const font = await doc.embedFont(StandardFonts.HelveticaBold);
      const textWidth = font.widthOfTextAtSize(text, fontSize);

      for (const page of doc.getPages()) {
        const { width, height } = page.getSize();
        page.drawText(text, {
          x: width / 2 - (textWidth / 2) * Math.cos((rotation * Math.PI) / 180),
          y: height / 2 - (textWidth / 2) * Math.sin((rotation * Math.PI) / 180),
          size: fontSize,
          font,
          color: rgb(0.4, 0.4, 0.4),
          opacity,
          rotate: degrees(rotation),
        });
      }

      const outBytes = await doc.save();
      const blob = new Blob([outBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '') + '-watermarked.pdf';
      a.click();
      URL.revokeObjectURL(url);
      setCompleted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not watermark this PDF.');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">Watermark PDF</h1>
      <p className="mt-2 text-gray-600">
        Stamp text across every page — draft markers, confidentiality notices, or a company name.
        Processed entirely in your browser.
      </p>

      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-12 text-center"
        >
          <p className="text-gray-600">{isLoadingPreview ? 'Reading pages…' : 'Click to choose a PDF file'}</p>
        </div>
      ) : (
        <>
          <div className="mt-6 space-y-3 rounded-lg border border-gray-200 bg-white p-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Watermark text</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <label className="text-xs text-gray-600">
                Size
                <input
                  type="range"
                  min={16}
                  max={96}
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="mt-1 w-full"
                />
              </label>
              <label className="text-xs text-gray-600">
                Opacity
                <input
                  type="range"
                  min={0.05}
                  max={0.8}
                  step={0.05}
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="mt-1 w-full"
                />
              </label>
              <label className="text-xs text-gray-600">
                Rotation
                <input
                  type="range"
                  min={-90}
                  max={90}
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="mt-1 w-full"
                />
              </label>
            </div>
          </div>

          <div className="relative mt-6 flex items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-surface p-6">
            {previewUrl && (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="First page preview" className="max-h-[480px] rounded shadow-level-2" />
                <span
                  className="pointer-events-none absolute left-1/2 top-1/2 whitespace-nowrap font-bold text-gray-500"
                  style={{
                    transform: `translate(-50%, -50%) rotate(${-rotation}deg)`,
                    fontSize: `${fontSize * 0.7}px`,
                    opacity,
                  }}
                >
                  {text || ' '}
                </span>
              </div>
            )}
          </div>
        </>
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
        disabled={!file || isProcessing || !text.trim()}
        className="mt-6 w-full rounded-lg bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isProcessing ? 'Applying…' : 'Apply Watermark & Download'}
      </button>

      {completed && <GuestEncouragementBar />}
    </div>
  );
}
