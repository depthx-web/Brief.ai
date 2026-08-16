'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { extractPdfText } from '@/lib/extractPdfText';
import {
  createProject,
  deleteDocument,
  downloadDocument,
  listDocuments,
  listProjects,
  searchLibrary,
  uploadDocument,
  type LibraryDocumentSummary,
  type LibrarySearchResult,
  type ProjectSummary,
} from '@/lib/libraryApi';
import { showError, showSuccess, showLoading, updateLoading, resolveLoading, failLoading } from '@/lib/toast';
import ProjectCard from './ProjectCard';
import NewProjectUploadDialog from './NewProjectUploadDialog';
import FileOptionsMenu from './FileOptionsMenu';
import SwitchWorkspaceModal from './SwitchWorkspaceModal';

export default function MyLibrary() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [unsorted, setUnsorted] = useState<LibraryDocumentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LibrarySearchResult[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingFiles, setPendingFiles] = useState<File[] | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    refreshLibrary(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function refreshLibrary(currentToken: string) {
    setIsLoading(true);
    try {
      const [projectList, docList] = await Promise.all([listProjects(currentToken), listDocuments(currentToken)]);
      setProjects(projectList);
      setUnsorted(docList.filter((d) => !d.projectId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your library.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleFilesSelected(fileList: FileList) {
    const files = Array.from(fileList).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    if (files.length === 0) {
      setError('Please select at least one PDF file.');
      return;
    }
    setError(null);
    setPendingFiles(files);
  }

  async function handleStartUpload(details: { name: string; category?: string; retentionDays: number }) {
    if (!token) return;
    const files = pendingFiles ?? [];
    setPendingFiles(null);
    const toastId = showLoading(
      files.length > 1 ? `Uploading 1 of ${files.length} files…` : `Uploading ${files[0].name}…`,
      files.length > 1 ? 0 : undefined
    );
    try {
      const project = await createProject(token, details.name, details.category);
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (files.length > 1) {
          updateLoading(toastId, `Uploading ${i + 1} of ${files.length} files…`, (i / files.length) * 100);
        }
        const pages = await extractPdfText(file);
        const fullText = pages.map((p) => p.text).join('\n\n');
        if (!fullText.trim()) continue;
        await uploadDocument(token, file, fullText, details.category, project.id, details.retentionDays);
      }
      resolveLoading(toastId, `${details.name} uploaded`);
      await refreshLibrary(token);
    } catch (err) {
      failLoading(toastId, err instanceof Error ? err.message : 'Could not upload these files.');
    }
  }

  async function handleDelete(id: string) {
    if (!token) return;
    try {
      await deleteDocument(token, id);
      setUnsorted((prev) => prev.filter((d) => d.id !== id));
      setResults((prev) => (prev ? prev.filter((d) => d.id !== id) : prev));
      showSuccess('File deleted');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not delete this document.');
    }
  }

  async function handleDownload(id: string, filename: string) {
    if (!token) return;
    try {
      await downloadDocument(token, id, filename);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not download this document.');
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

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium text-navy">My Library</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Files are grouped into projects — search across everything by meaning, not just keywords.
          </p>
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="rounded-md bg-emerald px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-dark"
        >
          New Project
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
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
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft">⌕</span>
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

      {results ? (
        <div className="mt-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Results for &ldquo;{query}&rdquo;
          </h2>
          {results.length === 0 ? (
            <div className="shadow-level-1 rounded-xl border border-gray-200 bg-white px-6 py-10 text-center">
              <p className="text-sm text-ink-soft">No matches.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {results.map((doc) => (
                <div key={doc.id} className="shadow-level-1 flex flex-col rounded-lg border border-gray-200 bg-white p-4">
                  <button onClick={() => router.push(`/workspace?doc=${doc.id}`)} className="text-left">
                    <p className="truncate font-mono text-sm text-ink hover:text-emerald">{doc.filename}</p>
                  </button>
                  <p className="mt-1 text-xs text-ink-soft">
                    {doc.snippet}… <span className="text-ink-soft/70">(match {(doc.score * 100).toFixed(0)}%)</span>
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-ink-soft">{new Date(doc.createdAt).toLocaleDateString()}</span>
                    <div className="flex gap-3 text-xs">
                      <button onClick={() => handleDownload(doc.id, doc.filename)} className="font-medium text-navy hover:text-emerald">
                        Download
                      </button>
                      <button onClick={() => handleDelete(doc.id)} className="font-medium text-ink-soft hover:text-redline">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="mt-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">
            {projects.length} Project{projects.length === 1 ? '' : 's'}
          </h2>
          {isLoading ? (
            <p className="text-sm text-ink-soft">Loading…</p>
          ) : projects.length === 0 && unsorted.length === 0 ? (
            <div className="shadow-level-1 rounded-xl border border-gray-200 bg-white px-6 py-10 text-center">
              <p className="text-sm text-ink-soft">
                No projects yet — add your first document above to get started.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onExtended={(updated) => setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))}
                  onDeleted={(id) => setProjects((prev) => prev.filter((p) => p.id !== id))}
                  onUpgradeNeeded={() => setUpgradeModalOpen(true)}
                />
              ))}
            </div>
          )}

          {unsorted.length > 0 && (
            <div className="mt-10">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-soft">Unsorted</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {unsorted.map((doc) => (
                  <div key={doc.id} className="shadow-level-1 flex flex-col rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-2">
                      <button onClick={() => router.push(`/workspace?doc=${doc.id}`)} className="min-w-0 text-left">
                        <p className="truncate font-mono text-sm text-ink hover:text-emerald">{doc.filename}</p>
                      </button>
                      <FileOptionsMenu
                        doc={doc}
                        onRenamed={(updated) => setUnsorted((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))}
                        onDeleted={(id) => setUnsorted((prev) => prev.filter((d) => d.id !== id))}
                        onUpgradeNeeded={() => setUpgradeModalOpen(true)}
                      />
                    </div>
                    <span className="mt-3 text-xs text-ink-soft">{new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <NewProjectUploadDialog
        open={pendingFiles !== null}
        files={pendingFiles ?? []}
        segment={user?.segment ?? null}
        onCancel={() => setPendingFiles(null)}
        onStart={handleStartUpload}
      />
      <SwitchWorkspaceModal open={upgradeModalOpen} initialStep="cycle" onClose={() => setUpgradeModalOpen(false)} />
    </div>
  );
}
