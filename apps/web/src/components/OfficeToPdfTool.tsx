'use client';

import { useRef, useState } from 'react';
import { convertOfficeToPdf, downloadBlob, type OfficeFamily } from '@/lib/convertApi';

const FAMILY_LABEL: Record<OfficeFamily, string> = { word: 'Word', excel: 'Excel', powerpoint: 'PowerPoint' };
const FAMILY_EXTENSIONS: Record<OfficeFamily, string[]> = {
  word: ['.doc', '.docx'],
  excel: ['.xls', '.xlsx'],
  powerpoint: ['.ppt', '.pptx'],
};

interface Props {
  family: OfficeFamily;
}

export default function OfficeToPdfTool({ family }: Props) {
  const label = FAMILY_LABEL[family];
  const extensions = FAMILY_EXTENSIONS[family];
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function isAcceptedFile(selected: File): boolean {
    const lower = selected.name.toLowerCase();
    return extensions.some((ext) => lower.endsWith(ext));
  }

  function handleFileSelect(selected: File) {
    setError(null);
    if (!isAcceptedFile(selected)) {
      setError(`Please select a ${label} file.`);
      return;
    }
    setFile(selected);
  }

  async function handleConvert() {
    if (!file) return;
    setError(null);
    setIsProcessing(true);
    try {
      const { blob, filename } = await convertOfficeToPdf(file, family);
      downloadBlob(blob, filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not convert this file.');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">{label} to PDF</h1>
      <p className="mt-2 text-gray-600">Convert a {label} file to PDF.</p>
      <p className="mt-1 text-xs text-gray-400">
        This tool sends your file to our conversion server (using a real office engine for accurate
        formatting). The file is deleted immediately after conversion.
      </p>

      <div
        onClick={() => inputRef.current?.click()}
        className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-12 text-center"
      >
        <p className="text-gray-600">{file ? file.name : `Click to choose a ${label} file`}</p>
        <input
          ref={inputRef}
          type="file"
          accept={extensions.join(',')}
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />
      </div>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        onClick={handleConvert}
        disabled={!file || isProcessing}
        className="mt-6 w-full rounded-lg bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isProcessing ? 'Converting…' : 'Convert to PDF & Download'}
      </button>
    </div>
  );
}
