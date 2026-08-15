'use client';

import { useRef, useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import GuestEncouragementBar from './GuestEncouragementBar';

interface ImageItem {
  id: string;
  file: File;
}

function isPng(file: File): boolean {
  return file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
}

function isJpeg(file: File): boolean {
  return (
    file.type === 'image/jpeg' ||
    file.name.toLowerCase().endsWith('.jpg') ||
    file.name.toLowerCase().endsWith('.jpeg')
  );
}

export default function ImagesToPdf() {
  const [items, setItems] = useState<ImageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const dragIndex = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function addFiles(fileList: FileList | File[]) {
    const images = Array.from(fileList).filter((f) => isPng(f) || isJpeg(f));
    if (images.length === 0) {
      setError('Please select JPG or PNG images.');
      return;
    }
    setError(null);
    setItems((prev) => [
      ...prev,
      ...images.map((file) => ({ id: `${file.name}-${file.size}-${crypto.randomUUID()}`, file })),
    ]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleDragStart(index: number) {
    dragIndex.current = index;
  }

  function handleDrop(index: number) {
    const from = dragIndex.current;
    dragIndex.current = null;
    if (from === null || from === index) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      return next;
    });
  }

  async function handleConvert() {
    if (items.length === 0) return;
    setError(null);
    setIsProcessing(true);
    try {
      const outDoc = await PDFDocument.create();
      for (const item of items) {
        const bytes = new Uint8Array(await item.file.arrayBuffer());
        const image = isPng(item.file) ? await outDoc.embedPng(bytes) : await outDoc.embedJpg(bytes);
        const page = outDoc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }
      const outBytes = await outDoc.save();
      const blob = new Blob([outBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'images.pdf';
      a.click();
      URL.revokeObjectURL(url);
      setCompleted(true);
    } catch (err) {
      setError(
        err instanceof Error ? `Could not convert: ${err.message}` : 'Could not convert these images.'
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">Images to PDF</h1>
      <p className="mt-2 text-gray-600">
        Combine JPG or PNG images into a single PDF. Processed entirely in your browser.
      </p>

      <div
        onClick={() => inputRef.current?.click()}
        className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-12 text-center"
      >
        <p className="text-gray-600">Click to choose JPG or PNG images</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {items.length > 0 && (
        <ul className="mt-6 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {items.map((item, index) => (
            <li
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              className="flex cursor-move items-center justify-between gap-3 px-4 py-3"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="text-gray-400">⠿</span>
                <span className="truncate text-sm font-medium text-gray-800">{item.file.name}</span>
              </div>
              <button
                onClick={() => removeItem(item.id)}
                className="shrink-0 text-sm text-gray-400 hover:text-red-600"
                aria-label={`Remove ${item.file.name}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={handleConvert}
        disabled={items.length === 0 || isProcessing}
        className="mt-6 w-full rounded-lg bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isProcessing ? 'Converting…' : `Convert ${items.length || ''} Images & Download`}
      </button>

      {completed && <GuestEncouragementBar />}
    </div>
  );
}
