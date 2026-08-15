'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '@/lib/AuthContext';
import { listDocuments, listProjects, fetchDocumentFile, type LibraryDocumentSummary } from '@/lib/libraryApi';
import { setPendingToolFile } from '@/lib/pendingToolFile';
import { showError } from '@/lib/toast';

interface Props {
  open: boolean;
  href?: string | null;
  onClose: () => void;
  // Two-slot pickers (Contract Compare, Multi-Paper Compare) stay on the
  // page and want the File directly; every single-destination tool instead
  // hands the file off via pendingToolFile + a route push. Exactly one of
  // href/onPick should be set.
  onPick?: (file: File) => void;
}

export default function ToolSourceModal({ open, href, onClose, onPick }: Props) {
  const { token } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<'choose' | 'library'>('choose');
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [docs, setDocs] = useState<LibraryDocumentSummary[] | null>(null);
  const [loadingDocId, setLoadingDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open || !token) return;
    setStep('choose');
    setDocs(null);
    listProjects(token)
      .then((p) => setProjectCount(p.length))
      .catch(() => setProjectCount(0));
  }, [open, token]);

  function handleFileChosen(file: File) {
    if (onPick) {
      onClose();
      onPick(file);
      return;
    }
    if (!href) return;
    setPendingToolFile(file);
    onClose();
    router.push(href);
  }

  async function openLibraryStep() {
    if (!token) return;
    setStep('library');
    if (!docs) {
      try {
        setDocs(await listDocuments(token));
      } catch (err) {
        showError(err instanceof Error ? err.message : 'Could not load your library.');
      }
    }
  }

  async function handlePickDoc(doc: LibraryDocumentSummary) {
    if (!token || !(href || onPick)) return;
    setLoadingDocId(doc.id);
    try {
      const file = await fetchDocumentFile(token, doc.id, doc.filename);
      handleFileChosen(file);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not load this file.');
    } finally {
      setLoadingDocId(null);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay-dim fixed inset-0 z-50" />
        <Dialog.Content className="animate-modal-in fixed left-1/2 top-1/2 z-50 w-full max-w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-7 shadow-level-4">
          {step === 'choose' ? (
            <>
              <Dialog.Title className="font-serif text-xl font-medium text-navy">Choose a file</Dialog.Title>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 px-4 py-8 text-center transition-colors hover:border-emerald"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-7 w-7 text-navy">
                    <path d="M7 18a4.6 4.4 0 0 1 0-9 5 4.5 0 0 1 9.8-1.5A4.5 4.5 0 0 1 18 18H7Z" strokeLinejoin="round" />
                  </svg>
                  <span className="text-sm font-medium text-ink">Upload a new file</span>
                  <span className="text-xs text-ink-soft">From your device</span>
                </button>
                <button
                  onClick={openLibraryStep}
                  className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 px-4 py-8 text-center transition-colors hover:border-emerald"
                >
                  <span aria-hidden className="text-2xl">
                    📎
                  </span>
                  <span className="text-sm font-medium text-ink">Choose from Library</span>
                  <span className="text-xs text-ink-soft">
                    From your projects{projectCount !== null ? ` (${projectCount})` : ''}
                  </span>
                </button>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handleFileChosen(e.target.files[0])}
              />
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <button onClick={() => setStep('choose')} className="text-ink-soft hover:text-ink" aria-label="Back">
                  ←
                </button>
                <Dialog.Title className="font-serif text-xl font-medium text-navy">Choose from Library</Dialog.Title>
              </div>
              <div className="mt-4 max-h-72 overflow-y-auto">
                {!docs ? (
                  <p className="text-sm text-ink-soft">Loading…</p>
                ) : docs.length === 0 ? (
                  <p className="text-sm text-ink-soft">Your library is empty.</p>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {docs.map((doc) => (
                      <li key={doc.id}>
                        <button
                          onClick={() => handlePickDoc(doc)}
                          disabled={loadingDocId !== null}
                          className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2.5 text-left hover:bg-gray-50 disabled:opacity-50"
                        >
                          <span className="truncate font-mono text-sm text-ink">{doc.filename}</span>
                          {loadingDocId === doc.id && <span className="text-xs text-ink-soft">Loading…</span>}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
