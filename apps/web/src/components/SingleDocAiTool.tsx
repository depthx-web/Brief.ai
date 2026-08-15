'use client';

import { useRef, useState, type ReactNode } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { extractPdfText, type PageText } from '@/lib/extractPdfText';
import { usePendingToolFile } from '@/lib/usePendingToolFile';
import { showError } from '@/lib/toast';

interface Props<T> {
  title: string;
  description: string;
  runLabel: string;
  onRun: (pages: PageText[], token: string | undefined) => Promise<T>;
  renderResult: (result: T) => ReactNode;
}

// Shared shell for the single-document AI Tools gateway entries (Batch 4,
// Section 2) that don't need a bespoke layout — upload, run, show result.
// Contract/Paper Compare and the signature/thumbnail-editor tools have real
// custom interfaces and don't use this.
export default function SingleDocAiTool<T>({ title, description, runLabel, onRun, renderResult }: Props<T>) {
  const { token } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageText[] | null>(null);
  const [result, setResult] = useState<T | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  usePendingToolFile(handleFileSelect);

  async function handleFileSelect(selected: File) {
    setError(null);
    setResult(null);
    setFile(null);
    setPages(null);
    if (selected.type !== 'application/pdf' && !selected.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file.');
      return;
    }
    try {
      const extracted = await extractPdfText(selected);
      setFile(selected);
      setPages(extracted);
    } catch {
      setError('Could not read this PDF. It may be corrupted, password-protected, or scanned without OCR.');
    }
  }

  async function handleRun() {
    if (!pages) return;
    setIsRunning(true);
    setError(null);
    try {
      setResult(await onRun(pages, token ?? undefined));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not complete this analysis.';
      setError(message);
      showError(message);
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">{title}</h1>
      <p className="mt-2 text-ink-soft">{description}</p>

      <div
        onClick={() => inputRef.current?.click()}
        className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-12 text-center"
      >
        <p className="text-ink-soft">{file ? file.name : 'Click to choose a PDF file'}</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />
      </div>

      {error && <p className="mt-4 text-sm text-redline">{error}</p>}

      {file && !result && (
        <button
          onClick={handleRun}
          disabled={isRunning || !pages}
          className="mt-6 w-full rounded-lg bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isRunning ? 'Working…' : runLabel}
        </button>
      )}

      {result && <div className="mt-8">{renderResult(result)}</div>}
    </div>
  );
}
