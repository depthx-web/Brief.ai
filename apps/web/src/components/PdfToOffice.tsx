'use client';

import { useRef, useState } from 'react';
import { convertFile, downloadBlob } from '@/lib/convertApi';
import { usePendingToolFile } from '@/lib/usePendingToolFile';

type Format = 'docx' | 'xlsx' | 'pptx';

const FORMAT_LABELS: Record<Format, string> = {
  docx: 'Word (.docx)',
  xlsx: 'Excel (.xlsx)',
  pptx: 'PowerPoint (.pptx)',
};

export default function PdfToOffice() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<Format>('docx');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  usePendingToolFile(handleFileSelect);

  function handleFileSelect(selected: File) {
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
      const { blob, filename } = await convertFile(file, format);
      downloadBlob(blob, filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not convert this file.');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">PDF to Office</h1>
      <p className="mt-2 text-gray-600">Convert a PDF to an editable Word, Excel, or PowerPoint file.</p>
      <p className="mt-1 text-xs text-gray-400">
        Unlike the other tools, this one sends your file to our conversion server (using a real
        office engine for accurate formatting). The file is deleted immediately after conversion.
        Note: how well this preserves layout depends on the PDF — scanned/complex documents convert
        less cleanly than text-based ones.
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
          {(Object.keys(FORMAT_LABELS) as Format[]).map((key) => (
            <label key={key} className="flex items-center gap-2">
              <input type="radio" checked={format === key} onChange={() => setFormat(key)} />
              {FORMAT_LABELS[key]}
            </label>
          ))}
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
