'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '@/lib/AuthContext';
import type { Segment } from '@/lib/authApi';
import {
  renameDocument,
  deleteDocument,
  downloadDocument,
  duplicateDocument,
  moveDocument,
  extendDocumentRetention,
  fetchDocumentFile,
  listProjects,
  type LibraryDocumentSummary,
  type ProjectSummary,
} from '@/lib/libraryApi';
import { setPendingToolFile } from '@/lib/pendingToolFile';
import { TOOLS_BY_TAB, type Tool } from './ToolsIndex';
import { toolLabelKeys } from '@/lib/toolCatalog';
import { showError, showSuccess } from '@/lib/toast';
import { useLocale } from '@/lib/i18n/LocaleContext';
import type { DictionaryKey } from '@/lib/i18n/dictionaries/en';
import RetentionConfirmDialog from './RetentionConfirmDialog';

const BILLING_ENFORCED = process.env.NEXT_PUBLIC_BILLING_ENFORCED === 'true';

const AI_ACTION_LABEL_KEY: Record<Segment, DictionaryKey> = {
  LAWYER: 'fileMenu.analyzeClausesAction',
  ACCOUNTANT: 'fileMenu.extractInvoiceAction',
  RESEARCHER: 'fileMenu.extractReferencesAction',
};

// Extra per-segment AI tools beyond the two generic Workspace actions above
// — only tools that take exactly one existing file (singleFileSource) fit
// a single-document context menu; two-file compare tools and batch/multi
// tools need their own page and aren't offered here.
function extraAiTools(segment: Segment | null): Tool[] {
  if (!segment) return [];
  return TOOLS_BY_TAB['AI tools'].filter((tool) => tool.singleFileSource && tool.segments?.includes(segment));
}

interface Props {
  doc: LibraryDocumentSummary;
  onRenamed: (doc: LibraryDocumentSummary) => void;
  onDeleted: (id: string) => void;
  onDuplicated?: (doc: LibraryDocumentSummary) => void;
  onUpgradeNeeded: () => void;
}

export default function FileOptionsMenu({ doc, onRenamed, onDeleted, onDuplicated, onUpgradeNeeded }: Props) {
  const { token, user } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [moveSubOpen, setMoveSubOpen] = useState(false);
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [confirmExtendDays, setConfirmExtendDays] = useState<7 | 30 | null>(null);

  const locked = BILLING_ENFORCED && user?.plan !== 'PAID';

  async function handleDownload(e: Event) {
    e.preventDefault();
    if (!token) return;
    try {
      await downloadDocument(token, doc.id, doc.filename);
    } catch (err) {
      showError(err instanceof Error ? err.message : t('fileMenu.couldNotDownload'));
    }
  }

  async function handleDelete(e: Event) {
    e.preventDefault();
    if (!token) return;
    try {
      await deleteDocument(token, doc.id);
      onDeleted(doc.id);
      showSuccess(t('library.fileDeleted'));
    } catch (err) {
      showError(err instanceof Error ? err.message : t('fileMenu.couldNotDelete'));
    }
  }

  async function handleDuplicate(e: Event) {
    e.preventDefault();
    if (!token) return;
    try {
      const copy = await duplicateDocument(token, doc.id);
      onDuplicated?.(copy);
      showSuccess(t('fileMenu.duplicated'));
    } catch (err) {
      showError(err instanceof Error ? err.message : t('fileMenu.couldNotDuplicate'));
    }
  }

  async function handleExtend(days: 7 | 30) {
    if (!token) return;
    try {
      const { expiresAt } = await extendDocumentRetention(token, doc.id, days);
      onRenamed({ ...doc, expiresAt });
      showSuccess(t('fileMenu.retentionExtended').replace('{days}', String(days)));
    } catch (err) {
      showError(err instanceof Error ? err.message : t('fileMenu.couldNotExtendRetention'));
    } finally {
      setConfirmExtendDays(null);
    }
  }

  async function loadProjects() {
    if (!token || projects) return;
    try {
      setProjects(await listProjects(token));
    } catch (err) {
      showError(err instanceof Error ? err.message : t('fileMenu.couldNotLoadProjects'));
    }
  }

  // A successful move means this file no longer belongs in whichever list
  // is currently showing it (Unsorted, a project's file grid, Recent) — the
  // same "remove from this list" contract onDeleted already provides, so it
  // reuses that instead of a new callback every call site would need too.
  async function handleMove(projectId: string | null) {
    if (!token || isBusy) return;
    setIsBusy(true);
    try {
      await moveDocument(token, doc.id, projectId);
      onDeleted(doc.id);
      showSuccess(projectId ? t('fileMenu.fileMoved') : t('fileMenu.fileMovedToUnsorted'));
    } catch (err) {
      showError(err instanceof Error ? err.message : t('fileMenu.couldNotMove'));
    } finally {
      setIsBusy(false);
    }
  }

  async function handleToolAction(tool: Tool) {
    if (locked) {
      onUpgradeNeeded();
      return;
    }
    if (!token) return;
    try {
      const file = await fetchDocumentFile(token, doc.id, doc.filename);
      setPendingToolFile(file);
      router.push(tool.href);
    } catch (err) {
      showError(err instanceof Error ? err.message : t('fileMenu.couldNotOpen'));
    }
  }

  function handleWorkspaceAction(e: Event) {
    e.preventDefault();
    if (locked) {
      onUpgradeNeeded();
      return;
    }
    router.push(`/workspace?doc=${doc.id}`);
  }

  const aiTools = extraAiTools(user?.segment ?? null);

  return (
    <>
      <DropdownMenu.Root open={open} onOpenChange={setOpen}>
        <DropdownMenu.Trigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            aria-label={t('fileMenu.fileOptions')}
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
            {/* Scrolls once the non-destructive items exceed ~8-9 rows;
                Delete stays pinned below, outside this container. */}
            <div className="max-h-[340px] overflow-y-auto">
              {user?.segment && (
                <>
                  <MenuItem onSelect={handleWorkspaceAction} locked={locked}>
                    {t('settings.opSummarize')}
                  </MenuItem>
                  <MenuItem onSelect={handleWorkspaceAction} locked={locked}>
                    {t(AI_ACTION_LABEL_KEY[user.segment])}
                  </MenuItem>
                  {aiTools.map((tool) => {
                    const labelKeys = toolLabelKeys(tool.name);
                    return (
                      <MenuItem key={tool.href + tool.name} onSelect={(e) => { e.preventDefault(); handleToolAction(tool); }} locked={locked}>
                        {labelKeys ? t(labelKeys.nameKey) : tool.name}
                      </MenuItem>
                    );
                  })}
                  <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
                </>
              )}

              <MenuItem onSelect={handleDownload}>{t('library.download')}</MenuItem>
              <MenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setRenameOpen(true);
                }}
              >
                {t('common.rename')}
              </MenuItem>
              <MenuItem onSelect={handleDuplicate}>{t('common.duplicate')}</MenuItem>

              <DropdownMenu.Sub
                open={moveSubOpen}
                onOpenChange={(next) => {
                  setMoveSubOpen(next);
                  if (next) loadProjects();
                }}
              >
                <DropdownMenu.SubTrigger className="flex cursor-pointer select-none items-center justify-between rounded-md px-2.5 py-2 text-[13px] text-ink outline-none transition-colors data-[highlighted]:bg-emerald-soft data-[state=open]:bg-emerald-soft">
                  {t('fileMenu.moveToProject')}
                  <span aria-hidden>›</span>
                </DropdownMenu.SubTrigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.SubContent
                    sideOffset={4}
                    className="animate-dropdown-in z-20 max-h-64 w-[220px] overflow-y-auto rounded-[10px] bg-white p-1.5 shadow-level-2"
                  >
                    {doc.projectId && (
                      <DropdownMenu.Item
                        onSelect={(e) => {
                          e.preventDefault();
                          handleMove(null);
                        }}
                        className="cursor-pointer select-none rounded-md px-2.5 py-2 text-[12px] text-ink outline-none transition-colors data-[highlighted]:bg-emerald-soft"
                      >
                        {t('library.unsorted')}
                      </DropdownMenu.Item>
                    )}
                    {!projects ? (
                      <p className="px-2.5 py-2 text-[12px] text-ink-soft">{t('common.loading')}</p>
                    ) : projects.filter((p) => p.id !== doc.projectId).length === 0 ? (
                      <p className="px-2.5 py-2 text-[12px] text-ink-soft">{t('fileMenu.noOtherProjects')}</p>
                    ) : (
                      projects
                        .filter((p) => p.id !== doc.projectId)
                        .map((p) => (
                          <DropdownMenu.Item
                            key={p.id}
                            onSelect={(e) => {
                              e.preventDefault();
                              handleMove(p.id);
                            }}
                            className="cursor-pointer select-none truncate rounded-md px-2.5 py-2 text-[12px] text-ink outline-none transition-colors data-[highlighted]:bg-emerald-soft"
                          >
                            {p.name}
                          </DropdownMenu.Item>
                        ))
                    )}
                  </DropdownMenu.SubContent>
                </DropdownMenu.Portal>
              </DropdownMenu.Sub>

              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger className="flex cursor-pointer select-none items-center justify-between rounded-md px-2.5 py-2 text-[13px] text-ink outline-none transition-colors data-[highlighted]:bg-emerald-soft data-[state=open]:bg-emerald-soft">
                  {t('fileMenu.extendRetention')}
                  <span aria-hidden>›</span>
                </DropdownMenu.SubTrigger>
                <DropdownMenu.Portal>
                  <DropdownMenu.SubContent
                    sideOffset={4}
                    className="animate-dropdown-in z-20 w-[180px] rounded-[10px] bg-white p-1.5 shadow-level-2"
                  >
                    <DropdownMenu.Item
                      onSelect={(e) => e.preventDefault()}
                      onClick={() => setConfirmExtendDays(7)}
                      className="cursor-pointer select-none rounded-md px-2.5 py-2 text-[12px] text-ink outline-none transition-colors data-[highlighted]:bg-emerald-soft"
                    >
                      {t('settings.retention7d')}
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onSelect={(e) => e.preventDefault()}
                      onClick={() => setConfirmExtendDays(30)}
                      className="cursor-pointer select-none rounded-md px-2.5 py-2 text-[12px] text-ink outline-none transition-colors data-[highlighted]:bg-emerald-soft"
                    >
                      {t('settings.retention30d')}
                    </DropdownMenu.Item>
                  </DropdownMenu.SubContent>
                </DropdownMenu.Portal>
              </DropdownMenu.Sub>
            </div>

            <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
            <DropdownMenu.Item
              onSelect={handleDelete}
              className="cursor-pointer select-none rounded-md px-2.5 py-2 text-[13px] text-redline outline-none transition-colors data-[highlighted]:bg-red-50"
            >
              {t('library.delete')}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <RenameDialog open={renameOpen} onOpenChange={setRenameOpen} doc={doc} onRenamed={onRenamed} />
      <RetentionConfirmDialog
        days={confirmExtendDays}
        onCancel={() => setConfirmExtendDays(null)}
        onConfirm={handleExtend}
      />
    </>
  );
}

function MenuItem({
  onSelect,
  locked,
  children,
}: {
  onSelect: (e: Event) => void;
  locked?: boolean;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu.Item
      onSelect={onSelect}
      className={`flex cursor-pointer select-none items-center justify-between rounded-md px-2.5 py-2 text-[13px] outline-none transition-colors ${
        locked ? 'text-ink opacity-45' : 'text-ink data-[highlighted]:bg-emerald-soft'
      }`}
    >
      <span>{children}</span>
      {locked && <LockBadge />}
    </DropdownMenu.Item>
  );
}

function LockBadge() {
  const { t } = useLocale();
  return (
    <span className="flex items-center gap-1">
      <span aria-hidden className="text-[10px]">
        🔒
      </span>
      <span className="rounded bg-navy-light px-1 py-0.5 font-mono text-[8px] font-semibold text-white">{t('toolsIndex.pro')}</span>
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
  const { t } = useLocale();
  const [name, setName] = useState(doc.filename);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !name.trim()) return;
    setIsSaving(true);
    try {
      const updated = await renameDocument(token, doc.id, name.trim());
      onRenamed(updated);
      showSuccess(t('fileMenu.fileRenamed'));
      onOpenChange(false);
    } catch (err) {
      showError(err instanceof Error ? err.message : t('fileMenu.couldNotRename'));
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
          <Dialog.Title className="font-serif text-lg font-semibold text-navy">{t('fileMenu.renameFileTitle')}</Dialog.Title>
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
                  {t('settings.cancel')}
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSaving || !name.trim()}
                className="rounded-lg bg-emerald px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isSaving ? t('common.saving') : t('common.save')}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
