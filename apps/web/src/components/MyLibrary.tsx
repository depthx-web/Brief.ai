'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { extractPdfText } from '@/lib/extractPdfText';
import {
  deleteDocument,
  downloadDocument,
  listDocuments,
  searchLibrary,
  uploadDocument,
  type LibraryDocumentSummary,
  type LibrarySearchResult,
} from '@/lib/libraryApi';

export default function MyLibrary() {
  const { token } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<LibraryDocumentSummary[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LibrarySearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    refreshDocuments(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function refreshDocuments(currentToken: string) {
    setIsLoadingDocs(true);
    try {
      setDocuments(await listDocuments(currentToken));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your library.');
    } finally {
      setIsLoadingDocs(false);
    }
  }

  async function handleFileSelect(file: File) {
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
        setError('No extractable text found — scanned PDFs need OCR first.');
        return;
      }
      const doc = await uploadDocument(token, file, fullText);
      await refreshDocuments(token);
      router.push(`/workspace?doc=${doc.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add this document.');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    setError(null);
    try {
      await deleteDocument(token, id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      setResults((prev) => (prev ? prev.filter((d) => d.id !== id) : prev));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete this document.');
    }
  }

  async function handleDownload(id: string, filename: string) {
    if (!token) return;
    setError(null);
    try {
      await downloadDocument(token, id, filename);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not download this document.');
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !query.trim()) return;
    setError(null);
    setIsSearching(true);
    try {
      setResults(await searchLibrary(token, query.trim()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed.');
    } finally {
      setIsSearching(false);
    }
  }

  const items = results ?? documents;

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-navy">My Library</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Search across every saved document by meaning, not just keywords.
          </p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="rounded-md bg-emerald px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isUploading ? 'Adding…' : 'Add Document'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        />
      </div>

      {error && <p className="mt-4 text-sm text-redline">{error}</p>}

      <form onSubmit={handleSearch} className="mt-6 flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your library by meaning…"
            className="w-full rounded-md border border-navy-light/30 py-2.5 pl-4 pr-10 text-sm"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft">
            ⌕
          </span>
        </div>
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className="rounded-md bg-navy px-4 py-2 text-sm font-medium text-white hover:bg-navy-light disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSearching ? 'Searching…' : 'Search'}
        </button>
        {results && (
          <button
            type="button"
            onClick={() => {
              setResults(null);
              setQuery('');
            }}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-ink-soft hover:bg-gray-50"
          >
            Clear
          </button>
        )}
      </form>

      <div className="mt-8">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
          {results ? `Results for "${query}"` : `${documents.length} Document(s)`}
        </h2>

        {isLoadingDocs ? (
          <p className="text-sm text-ink-soft">Loading…</p>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center">
            <p className="text-sm text-ink-soft">
              {results ? 'No matches.' : 'No documents yet — add one above to get started.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {items.map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col rounded-lg border border-gray-200 bg-white p-4"
              >
                <button
                  onClick={() => router.push(`/workspace?doc=${doc.id}`)}
                  className="text-left"
                >
                  <p className="truncate font-mono text-sm text-ink hover:text-emerald">
                    {doc.filename}
                  </p>
                </button>
                {'snippet' in doc && (
                  <p className="mt-1 text-xs text-ink-soft">
                    {(doc as LibrarySearchResult).snippet}…{' '}
                    <span className="text-ink-soft/70">
                      (match {((doc as LibrarySearchResult).score * 100).toFixed(0)}%)
                    </span>
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-ink-soft">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex gap-3 text-xs">
                    <button
                      onClick={() => handleDownload(doc.id, doc.filename)}
                      className="font-medium text-navy hover:text-emerald"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="font-medium text-ink-soft hover:text-redline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
