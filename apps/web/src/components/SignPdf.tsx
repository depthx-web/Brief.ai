'use client';

import { useEffect, useRef, useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '@/lib/AuthContext';
import { loadPdfForPreview, renderAllThumbnails, renderPageDataUrl } from '@/lib/pdfThumbnails';
import { usePendingToolFile } from '@/lib/usePendingToolFile';
import { listSignatures, saveSignature, deleteSignature, type SavedSignature } from '@/lib/signaturesApi';
import { showError, showSuccess } from '@/lib/toast';
import PageThumbnailStrip from './PageThumbnailStrip';
import GuestEncouragementBar from './GuestEncouragementBar';

const PREVIEW_WIDTH = 720;
const DEFAULT_WIDTH_PCT = 0.25;

interface PageItem {
  id: string;
  originalIndex: number;
  thumbnailUrl: string;
}

interface Placement {
  xPct: number; // center, 0-1 of page width
  yPct: number; // center, 0-1 of page height (from top)
  widthPct: number; // 0-1 of page width
}

interface ActiveSignature {
  src: string;
  aspectRatio: number; // height / width
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not load this image.'));
    img.src = src;
  });
}

export default function SignPdf() {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoadingThumbs, setIsLoadingThumbs] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [savedSignatures, setSavedSignatures] = useState<SavedSignature[]>([]);
  const [activeSignature, setActiveSignature] = useState<ActiveSignature | null>(null);
  const [placements, setPlacements] = useState<Record<number, Placement>>({});
  const [includeDate, setIncludeDate] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  usePendingToolFile(handleFileSelect);

  useEffect(() => {
    if (!token) return;
    listSignatures(token).then(setSavedSignatures).catch(() => {});
  }, [token]);

  async function handleFileSelect(selected: File) {
    setError(null);
    setFile(null);
    setPages([]);
    setSelectedId(null);
    setPreviewUrl(null);
    setPlacements({});
    setCompleted(false);
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
        thumbnailUrl: thumbnails[i],
      }));
      setFile(selected);
      setPages(items);
      setSelectedId(items[items.length - 1]?.id ?? null);
      if (items.length) setPreviewUrl(await renderPageDataUrl(previewDoc, items.length, PREVIEW_WIDTH));
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
    setPreviewUrl(await renderPageDataUrl(previewDoc, pages[index].originalIndex + 1, PREVIEW_WIDTH));
    await previewDoc.destroy();
  }

  const selectedPage = pages.find((p) => p.id === selectedId) ?? null;
  const currentPlacement = selectedPage ? placements[selectedPage.originalIndex] : undefined;

  function handlePreviewClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!activeSignature || !selectedPage || currentPlacement) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width;
    const yPct = (e.clientY - rect.top) / rect.height;
    setPlacements((prev) => ({
      ...prev,
      [selectedPage.originalIndex]: { xPct, yPct, widthPct: DEFAULT_WIDTH_PCT },
    }));
  }

  function updatePlacement(next: Placement) {
    if (!selectedPage) return;
    setPlacements((prev) => ({ ...prev, [selectedPage.originalIndex]: next }));
  }

  function removePlacement() {
    if (!selectedPage) return;
    setPlacements((prev) => {
      const next = { ...prev };
      delete next[selectedPage.originalIndex];
      return next;
    });
  }

  function applyToAllPages() {
    if (!currentPlacement) return;
    const next: Record<number, Placement> = {};
    pages.forEach((p) => {
      next[p.originalIndex] = currentPlacement;
    });
    setPlacements(next);
    showSuccess('Signature applied to every page');
  }

  async function handleDownload() {
    if (!file || !activeSignature || Object.keys(placements).length === 0) return;
    setError(null);
    setIsProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const doc = await PDFDocument.load(bytes);
      const isPng = activeSignature.src.startsWith('data:image/png');
      const imgBytes = await (await fetch(activeSignature.src)).arrayBuffer();
      const image = isPng ? await doc.embedPng(imgBytes) : await doc.embedJpg(imgBytes);
      const font = includeDate ? await doc.embedFont(StandardFonts.Helvetica) : null;

      for (const [indexStr, placement] of Object.entries(placements)) {
        const page = doc.getPages()[Number(indexStr)];
        const { width: pageWidth, height: pageHeight } = page.getSize();
        const drawWidth = pageWidth * placement.widthPct;
        const drawHeight = drawWidth * activeSignature.aspectRatio;
        const x = Math.min(Math.max(0, placement.xPct * pageWidth - drawWidth / 2), pageWidth - drawWidth);
        const y = Math.min(
          Math.max(0, pageHeight - placement.yPct * pageHeight - drawHeight / 2),
          pageHeight - drawHeight
        );
        page.drawImage(image, { x, y, width: drawWidth, height: drawHeight });
        if (font) {
          page.drawText(new Date().toLocaleDateString(), {
            x,
            y: Math.max(0, y - 12),
            size: 9,
            font,
            color: rgb(0.4, 0.4, 0.4),
          });
        }
      }

      const outBytes = await doc.save();
      const blob = new Blob([outBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.pdf$/i, '') + '-signed.pdf';
      a.click();
      URL.revokeObjectURL(url);
      setCompleted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign this PDF.');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">Sign PDF</h1>
      <p className="mt-2 text-gray-600">
        Place a signature on any page — drag to move, use the corner handles to resize. Processed
        entirely in your browser.
      </p>

      {!file ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-12 text-center"
        >
          <p className="text-gray-600">{isLoadingThumbs ? 'Reading pages…' : 'Click to choose a PDF file'}</p>
        </div>
      ) : (
        <div className="mt-6 flex h-[600px] overflow-hidden rounded-lg border border-gray-200 bg-white">
          <PageThumbnailStrip pages={pages} selectedId={selectedId} onSelect={handleSelect} />
          <div className="flex flex-1 flex-col">
            <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 px-4 py-3">
              <SignatureMenu
                savedSignatures={savedSignatures}
                onChoose={setActiveSignature}
                onCreateNew={() => setCreateOpen(true)}
                onDeleteSaved={async (id) => {
                  if (!token) return;
                  await deleteSignature(token, id);
                  setSavedSignatures((prev) => prev.filter((s) => s.id !== id));
                }}
              />
              {activeSignature && currentPlacement && (
                <>
                  <button onClick={applyToAllPages} className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50">
                    Apply to all pages
                  </button>
                  <button onClick={removePlacement} className="text-xs font-medium text-ink-soft hover:text-redline">
                    Remove from this page
                  </button>
                </>
              )}
              <label className="ml-auto flex items-center gap-2 text-xs text-ink-soft">
                <input type="checkbox" checked={includeDate} onChange={(e) => setIncludeDate(e.target.checked)} />
                Stamp date
              </label>
            </div>

            <div className="relative flex flex-1 items-center justify-center overflow-auto bg-surface p-6">
              {previewUrl && (
                <div
                  ref={previewRef}
                  data-preview-surface
                  onClick={handlePreviewClick}
                  className={`relative inline-block ${activeSignature && !currentPlacement ? 'cursor-crosshair' : ''}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt="Selected page preview" className="max-h-[480px] rounded shadow-level-2" draggable={false} />
                  {activeSignature && currentPlacement && (
                    <SignatureOverlay
                      src={activeSignature.src}
                      aspectRatio={activeSignature.aspectRatio}
                      placement={currentPlacement}
                      onChange={updatePlacement}
                    />
                  )}
                </div>
              )}
              {activeSignature && !currentPlacement && (
                <p className="pointer-events-none absolute bottom-8 rounded bg-navy/80 px-3 py-1.5 text-xs text-white">
                  Click on the page to place your signature
                </p>
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
        disabled={!file || isProcessing || Object.keys(placements).length === 0}
        className="mt-6 w-full rounded-lg bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isProcessing ? 'Signing…' : 'Sign & Download'}
      </button>

      {completed && <GuestEncouragementBar />}

      <CreateSignatureDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        canSave={!!token}
        onCreated={(sig, save, name) => {
          setActiveSignature(sig);
          setCreateOpen(false);
          if (save && token && name) {
            saveSignature(token, name, sig.src)
              .then((saved) => setSavedSignatures((prev) => [saved, ...prev]))
              .catch((err) => showError(err instanceof Error ? err.message : 'Could not save this signature.'));
          }
        }}
      />
    </div>
  );
}

function SignatureMenu({
  savedSignatures,
  onChoose,
  onCreateNew,
  onDeleteSaved,
}: {
  savedSignatures: SavedSignature[];
  onChoose: (sig: ActiveSignature) => void;
  onCreateNew: () => void;
  onDeleteSaved: (id: string) => void;
}) {
  async function choose(imageData: string) {
    const img = await loadImage(imageData);
    onChoose({ src: imageData, aspectRatio: img.height / img.width });
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium hover:bg-gray-50">
          My saved signatures
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="start" sideOffset={6} className="animate-dropdown-in z-20 w-[240px] rounded-[10px] bg-white p-1.5 shadow-level-2">
          {savedSignatures.length === 0 ? (
            <p className="px-2.5 py-2 text-[12px] text-ink-soft">No saved signatures yet.</p>
          ) : (
            savedSignatures.map((sig) => (
              <div key={sig.id} className="group flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-emerald-soft">
                <button onClick={() => choose(sig.imageData)} className="flex flex-1 items-center gap-2 overflow-hidden text-start">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={sig.imageData} alt={sig.name} className="h-6 w-12 shrink-0 rounded border border-gray-200 bg-white object-contain" />
                  <span className="truncate text-[12px] text-ink">{sig.name}</span>
                </button>
                <button
                  onClick={() => onDeleteSaved(sig.id)}
                  className="shrink-0 text-[11px] text-ink-soft opacity-0 hover:text-redline group-hover:opacity-100"
                  aria-label={`Delete ${sig.name}`}
                >
                  ✕
                </button>
              </div>
            ))
          )}
          <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
          <DropdownMenu.Item
            onSelect={onCreateNew}
            className="cursor-pointer select-none rounded-md px-2.5 py-2 text-[13px] font-medium text-emerald outline-none data-[highlighted]:bg-emerald-soft"
          >
            + New signature
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function CreateSignatureDialog({
  open,
  onClose,
  canSave,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  canSave: boolean;
  onCreated: (sig: ActiveSignature, save: boolean, name?: string) => void;
}) {
  const [tab, setTab] = useState<'draw' | 'upload'>('draw');
  const [drawnSrc, setDrawnSrc] = useState<string | null>(null);
  const [uploadedSrc, setUploadedSrc] = useState<string | null>(null);
  const [name, setName] = useState('My signature');
  const [saveIt, setSaveIt] = useState(canSave);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setDrawnSrc(null);
      setUploadedSrc(null);
      setTab('draw');
      setSaveIt(canSave);
    }
  }, [open, canSave]);

  function getPoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * canvas.width, y: ((e.clientY - rect.top) / rect.height) * canvas.height };
  }

  function handleDrawStart(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawing.current = true;
    lastPoint.current = getPoint(e);
  }

  function handleDrawMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const point = getPoint(e);
    if (!canvas || !ctx || !point || !lastPoint.current) return;
    ctx.strokeStyle = '#1a202c';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPoint.current = point;
  }

  function handleDrawEnd() {
    isDrawing.current = false;
    lastPoint.current = null;
    if (canvasRef.current) setDrawnSrc(canvasRef.current.toDataURL('image/png'));
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setDrawnSrc(null);
  }

  function handleUpload(selected: File) {
    if (selected.type !== 'image/png' && selected.type !== 'image/jpeg') {
      showError('Please upload a PNG or JPEG image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setUploadedSrc(reader.result as string);
    reader.readAsDataURL(selected);
  }

  async function handleUse() {
    const src = tab === 'draw' ? drawnSrc : uploadedSrc;
    if (!src) return;
    const img = await loadImage(src);
    onCreated({ src, aspectRatio: img.height / img.width }, saveIt && canSave, name.trim() || 'My signature');
  }

  const currentSrc = tab === 'draw' ? drawnSrc : uploadedSrc;

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay-dim fixed inset-0 z-50" />
        <Dialog.Content className="animate-modal-in fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-level-4">
          <Dialog.Title className="font-serif text-lg font-semibold text-navy">New signature</Dialog.Title>

          <div className="mt-4 flex gap-1">
            <button
              onClick={() => setTab('draw')}
              className={`rounded-t-md px-4 py-2 text-sm font-medium ${tab === 'draw' ? 'bg-paper text-navy' : 'bg-gray-100 text-ink-soft'}`}
            >
              Draw
            </button>
            <button
              onClick={() => setTab('upload')}
              className={`rounded-t-md px-4 py-2 text-sm font-medium ${tab === 'upload' ? 'bg-paper text-navy' : 'bg-gray-100 text-ink-soft'}`}
            >
              Upload image
            </button>
          </div>

          <div className="rounded-b-md rounded-tr-md bg-paper p-4">
            {tab === 'draw' ? (
              <>
                {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={140}
                  style={{ touchAction: 'none' }}
                  className="w-full rounded border border-paper-line bg-white"
                  onPointerDown={handleDrawStart}
                  onPointerMove={handleDrawMove}
                  onPointerUp={handleDrawEnd}
                />
                <button onClick={clearCanvas} className="mt-2 text-xs text-ink-soft hover:text-redline">
                  Clear
                </button>
              </>
            ) : (
              <div
                onClick={() => uploadInputRef.current?.click()}
                className="flex h-[140px] cursor-pointer flex-col items-center justify-center rounded border border-dashed border-paper-line bg-white text-center"
              >
                {uploadedSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={uploadedSrc} alt="Uploaded signature" className="max-h-[110px]" />
                ) : (
                  <p className="text-xs text-ink-soft">Click to upload a PNG or JPEG</p>
                )}
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                />
              </div>
            )}
          </div>

          {canSave && (
            <div className="mt-4 flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={saveIt} onChange={(e) => setSaveIt(e.target.checked)} />
                Save for later
              </label>
              {saveIt && (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Signature name"
                  className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                />
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="text-sm font-medium text-ink-soft hover:text-ink">
              Cancel
            </button>
            <button
              onClick={handleUse}
              disabled={!currentSrc}
              className="rounded-lg bg-emerald px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Use this signature
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function SignatureOverlay({
  src,
  aspectRatio,
  placement,
  onChange,
}: {
  src: string;
  aspectRatio: number;
  placement: Placement;
  onChange: (next: Placement) => void;
}) {
  const [dragTooltip, setDragTooltip] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  function startMove(e: React.PointerEvent) {
    e.stopPropagation();
    const parent = (e.currentTarget as HTMLElement).closest('[data-preview-surface]') as HTMLElement | null;
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startPlacement = placement;

    function onMove(ev: PointerEvent) {
      const dx = (ev.clientX - startX) / parentRect.width;
      const dy = (ev.clientY - startY) / parentRect.height;
      onChange({ ...startPlacement, xPct: startPlacement.xPct + dx, yPct: startPlacement.yPct + dy });
    }
    function onUp() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  function startResize(e: React.PointerEvent) {
    e.stopPropagation();
    const parent = (e.currentTarget as HTMLElement).closest('[data-preview-surface]') as HTMLElement | null;
    if (!parent) return;
    const parentRect = parent.getBoundingClientRect();
    const startX = e.clientX;
    const startWidthPct = placement.widthPct;

    function onMove(ev: PointerEvent) {
      const dx = (ev.clientX - startX) / parentRect.width;
      const nextWidthPct = Math.max(0.05, Math.min(0.9, startWidthPct + dx * 2));
      onChange({ ...placement, widthPct: nextWidthPct });
      setDragTooltip(`${Math.round((nextWidthPct / DEFAULT_WIDTH_PCT) * 100)}%`);
    }
    function onUp() {
      setDragTooltip(null);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  const widthPx = placement.widthPct * 100;
  const heightPx = widthPx * aspectRatio;

  return (
    <div
      ref={containerRef}
      className="absolute cursor-move"
      style={{
        left: `${placement.xPct * 100}%`,
        top: `${placement.yPct * 100}%`,
        width: `${widthPx}%`,
        height: `${heightPx}%`,
        transform: 'translate(-50%, -50%)',
      }}
      onPointerDown={startMove}
    >
      <div className="pointer-events-none absolute inset-0 border border-dashed border-emerald" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Signature" className="h-full w-full select-none object-contain" draggable={false} />
      {(['nw', 'ne', 'sw', 'se'] as const).map((corner) => (
        <span
          key={corner}
          onPointerDown={startResize}
          className={`absolute h-3 w-3 cursor-nwse-resize rounded-full border-2 border-white bg-emerald ${
            corner.includes('n') ? '-top-1.5' : '-bottom-1.5'
          } ${corner.includes('w') ? '-left-1.5' : '-right-1.5'}`}
        />
      ))}
      {dragTooltip && (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-navy px-2 py-1 font-mono text-[10px] text-white">
          {dragTooltip}
        </span>
      )}
    </div>
  );
}
