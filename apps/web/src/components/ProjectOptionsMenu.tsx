'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '@/lib/AuthContext';
import type { Segment } from '@/lib/authApi';
import {
  deleteProject,
  extendProjectRetention,
  getProject,
  type LibraryDocumentSummary,
  type ProjectSummary,
} from '@/lib/libraryApi';
import { showError, showSuccess } from '@/lib/toast';

const BILLING_ENFORCED = process.env.NEXT_PUBLIC_BILLING_ENFORCED === 'true';

const SEGMENT_PROJECT_ACTION: Record<Segment, string | null> = {
  LAWYER: 'Compare contracts',
  ACCOUNTANT: null,
  RESEARCHER: null,
};

interface Props {
  project: ProjectSummary;
  onExtended: (project: ProjectSummary) => void;
  onDeleted: (id: string) => void;
  onUpgradeNeeded: () => void;
}

export default function ProjectOptionsMenu({ project, onExtended, onDeleted, onUpgradeNeeded }: Props) {
  const { token, user } = useAuth();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [filesSubOpen, setFilesSubOpen] = useState(false);
  const [files, setFiles] = useState<LibraryDocumentSummary[] | null>(null);

  const locked = BILLING_ENFORCED && user?.plan !== 'PAID';
  const segmentAction = user?.segment ? SEGMENT_PROJECT_ACTION[user.segment] : null;

  async function loadFiles() {
    if (!token || files) return;
    try {
      const detail = await getProject(token, project.id);
      setFiles(detail.documents);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not load the project files.');
    }
  }

  async function handleExtend(days: 7 | 30) {
    if (!token) return;
    try {
      const updated = await extendProjectRetention(token, project.id, days);
      onExtended({ ...project, nearestExpiresAt: updated.expiresAt });
      showSuccess(`Retention extended to ${days} days`);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not extend retention.');
    }
  }

  async function handleDeleteFile(docId: string) {
    if (!token) return;
    const { deleteDocument } = await import('@/lib/libraryApi');
    try {
      await deleteDocument(token, docId);
      setFiles((prev) => prev?.filter((f) => f.id !== docId) ?? null);
      showSuccess('File deleted');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not delete this file.');
    }
  }

  async function handleDeleteProject() {
    if (!token) return;
    try {
      await deleteProject(token, project.id);
      onDeleted(project.id);
      showSuccess('Project deleted');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not delete this project.');
    } finally {
      setConfirmOpen(false);
    }
  }

  function handleAiAction() {
    if (locked) {
      onUpgradeNeeded();
      return;
    }
    if (files?.[0]) router.push(`/workspace?doc=${files[0].id}`);
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            aria-label="Project options"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-gray-100 hover:text-ink"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <circle cx="10" cy="4" r="1.4" />
              <circle cx="10" cy="10" r="1.4" />
              <circle cx="10" cy="16" r="1.4" />
            </svg>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={6}
            className="animate-dropdown-in z-20 w-[240px] rounded-[10px] bg-white p-1.5 shadow-level-2"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu.Item
              onSelect={(e) => {
                e.preventDefault();
                loadFiles().then(handleAiAction);
              }}
              className={`flex cursor-pointer select-none items-center justify-between rounded-md px-2.5 py-2 text-[13px] outline-none transition-colors ${
                locked ? 'text-ink opacity-45' : 'text-ink data-[highlighted]:bg-emerald-soft'
              }`}
            >
              <span>Summarize the whole project</span>
              {locked && <LockBadge />}
            </DropdownMenu.Item>

            {segmentAction && (
              <DropdownMenu.Item
                onSelect={(e) => {
                  e.preventDefault();
                  loadFiles().then(handleAiAction);
                }}
                className={`flex cursor-pointer select-none items-center justify-between rounded-md px-2.5 py-2 text-[13px] outline-none transition-colors ${
                  locked ? 'text-ink opacity-45' : 'text-ink data-[highlighted]:bg-emerald-soft'
                }`}
              >
                <span>{segmentAction}</span>
                {locked && <LockBadge />}
              </DropdownMenu.Item>
            )}

            <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />

            <DropdownMenu.Item
              onSelect={(e) => e.preventDefault()}
              onClick={() => handleExtend(7)}
              className="cursor-pointer select-none rounded-md px-2.5 py-2 text-[13px] text-ink outline-none transition-colors data-[highlighted]:bg-emerald-soft"
            >
              Extend retention — 7 days
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={(e) => e.preventDefault()}
              onClick={() => handleExtend(30)}
              className="cursor-pointer select-none rounded-md px-2.5 py-2 text-[13px] text-ink outline-none transition-colors data-[highlighted]:bg-emerald-soft"
            >
              Extend retention — 30 days
            </DropdownMenu.Item>

            <DropdownMenu.Sub
              open={filesSubOpen}
              onOpenChange={(next) => {
                setFilesSubOpen(next);
                if (next) loadFiles();
              }}
            >
              <DropdownMenu.SubTrigger className="flex cursor-pointer select-none items-center justify-between rounded-md px-2.5 py-2 text-[13px] text-ink outline-none transition-colors data-[highlighted]:bg-emerald-soft data-[state=open]:bg-emerald-soft">
                Delete a file from this project
                <span aria-hidden>›</span>
              </DropdownMenu.SubTrigger>
              <DropdownMenu.Portal>
                <DropdownMenu.SubContent
                  sideOffset={4}
                  className="animate-dropdown-in z-20 max-h-64 w-[220px] overflow-y-auto rounded-[10px] bg-white p-1.5 shadow-level-2"
                >
                  {!files ? (
                    <p className="px-2.5 py-2 text-[12px] text-ink-soft">Loading…</p>
                  ) : files.length === 0 ? (
                    <p className="px-2.5 py-2 text-[12px] text-ink-soft">No files.</p>
                  ) : (
                    files.map((f) => (
                      <DropdownMenu.Item
                        key={f.id}
                        onSelect={(e) => {
                          e.preventDefault();
                          handleDeleteFile(f.id);
                        }}
                        className="cursor-pointer select-none truncate rounded-md px-2.5 py-2 text-[12px] text-redline outline-none transition-colors data-[highlighted]:bg-red-50"
                      >
                        {f.filename}
                      </DropdownMenu.Item>
                    ))
                  )}
                </DropdownMenu.SubContent>
              </DropdownMenu.Portal>
            </DropdownMenu.Sub>

            <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
            <DropdownMenu.Item
              onSelect={(e) => {
                e.preventDefault();
                setConfirmOpen(true);
              }}
              className="cursor-pointer select-none rounded-md px-2.5 py-2 text-[13px] text-redline outline-none transition-colors data-[highlighted]:bg-red-50"
            >
              Permanently delete the project
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <Dialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="overlay-dim fixed inset-0 z-50" />
          <Dialog.Content className="animate-modal-in fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-level-4">
            <Dialog.Title className="font-serif text-lg font-semibold text-redline">Are you sure?</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-ink-soft">
              This permanently deletes &ldquo;{project.name}&rdquo; and all {project.documentCount} file
              {project.documentCount === 1 ? '' : 's'} inside it. This cannot be undone.
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-3">
              <Dialog.Close asChild>
                <button className="text-sm font-medium text-ink-soft hover:text-ink">Cancel</button>
              </Dialog.Close>
              <button
                onClick={handleDeleteProject}
                className="rounded-lg bg-redline px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Delete permanently
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

function LockBadge() {
  return (
    <span className="flex items-center gap-1">
      <span aria-hidden className="text-[10px]">
        🔒
      </span>
      <span className="rounded bg-navy-light px-1 py-0.5 font-mono text-[8px] font-semibold text-white">PRO</span>
    </span>
  );
}
