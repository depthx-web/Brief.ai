'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '@/lib/AuthContext';
import type { Segment } from '@/lib/authApi';
import { renameDocument, deleteDocument, downloadDocument, type LibraryDocumentSummary } from '@/lib/libraryApi';
import { showError, showSuccess } from '@/lib/toast';

const BILLING_ENFORCED = process.env.NEXT_PUBLIC_BILLING_ENFORCED === 'true';

const AI_ACTION_LABEL: Record<Segment, string> = {
  LAWYER: 'Analyze clauses',
  ACCOUNTANT: 'Extract invoice data',
  RESEARCHER: 'Extract references',
};

interface Props {
  doc: LibraryDocumentSummary;
  onRenamed: (doc: LibraryDocumentSummary) => void;
  onDeleted: (id: string) => void;
  onUpgradeNeeded: () => void;
}

export default function FileOptionsMenu({ doc, onRenamed, onDeleted, onUpgradeNeeded }: Props) {
  const { token, user } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);

  const locked = BILLING_ENFORCED && user?.plan !== 'PAID';

  async function handleDownload(e: Event) {
    e.preventDefault();
    if (!token) return;
    try {
      await downloadDocument(token, doc.id, doc.filename);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not download this file.');
    }
  }

  async function handleDelete(e: Event) {
    e.preventDefault();
    if (!token) return;
    try {
      await deleteDocument(token, doc.id);
      onDeleted(doc.id);
      showSuccess('File deleted');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not delete this file.');
    }
  }

  function handleAiAction(e: Event) {
    e.preventDefault();
    if (locked) {
      onUpgradeNeeded();
      return;
    }
    router.push(`/workspace?doc=${doc.id}`);
  }

  return (
    <>
      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            aria-label="File options"
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
            className="animate-dropdown-in z-20 w-[220px] rounded-[10px] bg-white p-1.5 shadow-level-2"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenu.Item
              onSelect={handleDownload}
              className="cursor-pointer select-none rounded-md px-2.5 py-2 text-[13px] text-ink outline-none transition-colors data-[highlighted]:bg-emerald-soft"
            >
              Download
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={(e) => {
                e.preventDefault();
                setRenameOpen(true);
              }}
              className="cursor-pointer select-none rounded-md px-2.5 py-2 text-[13px] text-ink outline-none transition-colors data-[highlighted]:bg-emerald-soft"
            >
              Rename
            </DropdownMenu.Item>

            {user?.segment && (
              <>
                <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
                <DropdownMenu.Item
                  onSelect={handleAiAction}
                  className={`flex cursor-pointer select-none items-center justify-between rounded-md px-2.5 py-2 text-[13px] outline-none transition-colors ${
                    locked ? 'text-ink opacity-45' : 'text-ink data-[highlighted]:bg-emerald-soft'
                  }`}
                >
                  <span>Summarize</span>
                  {locked && <LockBadge />}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={handleAiAction}
                  className={`flex cursor-pointer select-none items-center justify-between rounded-md px-2.5 py-2 text-[13px] outline-none transition-colors ${
                    locked ? 'text-ink opacity-45' : 'text-ink data-[highlighted]:bg-emerald-soft'
                  }`}
                >
                  <span>{AI_ACTION_LABEL[user.segment]}</span>
                  {locked && <LockBadge />}
                </DropdownMenu.Item>
              </>
            )}

            <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
            <DropdownMenu.Item
              onSelect={handleDelete}
              className="cursor-pointer select-none rounded-md px-2.5 py-2 text-[13px] text-redline outline-none transition-colors data-[highlighted]:bg-red-50"
            >
              Delete
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <RenameDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        doc={doc}
        onRenamed={onRenamed}
      />
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

function RenameDialog({
  open,
  onOpenChange,
  doc,
  onRenamed,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doc: LibraryDocumentSummary;
  onRenamed: (doc: LibraryDocumentSummary) => void;
}) {
  const { token } = useAuth();
  const [name, setName] = useState(doc.filename);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !name.trim()) return;
    setIsSaving(true);
    try {
      const updated = await renameDocument(token, doc.id, name.trim());
      onRenamed(updated);
      showSuccess('File renamed');
      onOpenChange(false);
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not rename this file.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setName(doc.filename);
        onOpenChange(next);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="overlay-dim fixed inset-0 z-50" />
        <Dialog.Content className="animate-modal-in fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-level-4">
          <Dialog.Title className="font-serif text-lg font-semibold text-navy">Rename file</Dialog.Title>
          <form onSubmit={handleSave} className="mt-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <div className="mt-5 flex justify-end gap-3">
              <Dialog.Close asChild>
                <button type="button" className="text-sm font-medium text-ink-soft hover:text-ink">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSaving || !name.trim()}
                className="rounded-lg bg-emerald px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
