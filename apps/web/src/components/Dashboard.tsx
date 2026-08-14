'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { extractPdfText } from '@/lib/extractPdfText';
import { listDocuments, uploadDocument, type LibraryDocumentSummary } from '@/lib/libraryApi';
import type { Segment } from '@/lib/authApi';

const UPLOAD_LABEL: Record<Segment, string> = {
  LAWYER: 'Upload a Contract',
  ACCOUNTANT: 'Upload an Invoice',
  RESEARCHER: 'Upload a Research Paper',
};

export default function Dashboard() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [recent, setRecent] = useState<LibraryDocumentSummary[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    listDocuments(token)
      .then((docs) => setRecent(docs.slice(0, 6)))
      .catch(() => {})
      .finally(() => setIsLoadingRecent(false));
  }, [token]);

  async function handleFile(file: File) {
    if (!token) return;
    setError(null);
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF file.');
      return;
    }
    setIsUploading(true);
    try {
      const pages = await extractPdfText(file);
      const fullText = pages.map((p) => p.text).join('\n\n');
      if (!fullText.trim()) {
        setError('No extractable text found — scanned documents need OCR first.');
        return;
      }
      const doc = await uploadDocument(token, file, fullText);
      router.push(`/workspace?doc=${doc.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload this document.');
    } finally {
      setIsUploading(false);
    }
  }

  const uploadLabel = user?.segment ? UPLOAD_LABEL[user.segment] : 'Upload a File';

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium text-navy">
          Welcome{user?.name ? `, ${user.name}` : ''}
        </h1>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="rounded-md bg-emerald px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isUploading ? 'Uploading…' : uploadLabel}
        </button>
      </div>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
        }}
        className={`mt-8 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-white px-6 py-16 text-center transition-colors ${
          isDragOver ? 'border-emerald bg-emerald-soft' : 'border-navy-light/30'
        }`}
      >
        <svg
          className="mb-4 h-10 w-10 text-navy-light"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            d="M7 18a4.6 4.4 0 0 1 0-9 5 4.5 0 0 1 9.8-1.5A4.5 4.5 0 0 1 18 18H7Z"
            strokeLinejoin="round"
          />
          <path d="M12 12v6M9.5 14.5 12 12l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="text-sm text-ink-soft">
          {isUploading ? 'Reading document…' : 'Drag your file here, or click to choose'}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      {error && <p className="mt-4 text-sm text-redline">{error}</p>}

      <div className="mt-12">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-ink-soft">
          Recent Files
        </h2>
        {isLoadingRecent ? (
          <p className="text-sm text-ink-soft">Loading…</p>
        ) : recent.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center">
            <p className="text-sm text-ink-soft">
              You haven&apos;t uploaded anything yet — drag your first document above to get
              started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {recent.map((doc) => (
              <button
                key={doc.id}
                onClick={() => router.push(`/workspace?doc=${doc.id}`)}
                className="rounded-lg border border-gray-200 bg-white p-4 text-left transition-colors hover:border-emerald"
              >
                <p className="truncate font-mono text-sm text-ink">{doc.filename}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-ink-soft">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                  <span className="rounded-full bg-emerald-soft px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald">
                    Ready
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
