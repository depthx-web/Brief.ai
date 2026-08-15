'use client';

import { useRef, useState } from 'react';
import { unlockPdf, downloadBlob } from '@/lib/convertApi';
import { usePendingToolFile } from '@/lib/usePendingToolFile';

export default function RemovePasswordPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
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

  async function handleUnlock() {
    if (!file || !password) return;
    setError(null);
    setIsProcessing(true);
    try {
      const { blob, filename } = await unlockPdf(file, password);
      downloadBlob(blob, filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove the password.');
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">Remove Password</h1>
      <p className="mt-2 text-gray-600">
        Remove password protection from a PDF. You need to know the current password.
      </p>
      <p className="mt-1 text-xs text-gray-400">
        This tool sends your file to our conversion server (using a real encryption engine, qpdf).
        The file and password are deleted immediately after processing.
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
        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
          <label className="block text-sm font-medium text-gray-700">Current password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      )}

      <button
        onClick={handleUnlock}
        disabled={!file || !password || isProcessing}
        className="mt-6 w-full rounded-lg bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isProcessing ? 'Removing…' : 'Remove Password & Download'}
      </button>
    </div>
  );
}
