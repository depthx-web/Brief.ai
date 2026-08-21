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
import { setProjectVisibility } from '@/lib/teamApi';
import { showError, showSuccess } from '@/lib/toast';
import { useLocale } from '@/lib/i18n/LocaleContext';
import type { DictionaryKey } from '@/lib/i18n/dictionaries/en';
import RetentionConfirmDialog from './RetentionConfirmDialog';

const BILLING_ENFORCED = process.env.NEXT_PUBLIC_BILLING_ENFORCED === 'true';

const SEGMENT_PROJECT_ACTION_KEY: Record<Segment, DictionaryKey | null> = {
  LAWYER: 'projectMenu.compareContracts',
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
  const { t } = useLocale();
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [filesSubOpen, setFilesSubOpen] = useState(false);
  const [files, setFiles] = useState<LibraryDocumentSummary[] | null>(null);
  const [confirmExtendDays, setConfirmExtendDays] = useState<7 | 30 | null>(null);

  const locked = BILLING_ENFORCED && user?.plan !== 'PAID';
  const segmentActionKey = user?.segment ? SEGMENT_PROJECT_ACTION_KEY[user.segment] : null;

  async function loadFiles() {
    if (!token || files) return;
    try {
      const detail = await getProject(token, project.id);
      setFiles(detail.documents);
    } catch (err) {
      showError(err instanceof Error ? err.message : t('projectMenu.couldNotLoadFiles'));
    }
  }

  async function handleExtend(days: 7 | 30) {
    if (!token) return;
    try {
      const updated = await extendProjectRetention(token, project.id, days);
      onExtended({ ...project, nearestExpiresAt: updated.expiresAt });
      showSuccess(t('fileMenu.retentionExtended').replace('{days}', String(days)));
    } catch (err) {
      showError(err instanceof Error ? err.message : t('fileMenu.couldNotExtendRetention'));
    } finally {
      setConfirmExtendDays(null);
    }
  }

  async function handleDeleteFile(docId: string) {
    if (!token) return;
    const { deleteDocument } = await import('@/lib/libraryApi');
    try {
      await deleteDocument(token, docId);
      setFiles((prev) => prev?.filter((f) => f.id !== docId) ?? null);
      showSuccess(t('library.fileDeleted'));
    } catch (err) {
      showError(err instanceof Error ? err.message : t('fileMenu.couldNotDelete'));
    }
  }

  async function handleToggleVisibility() {
    if (!token || !project.teamId) return;
    const next = project.visibility === 'PRIVATE' ? 'SHARED_WITH_TEAM' : 'PRIVATE';
    try {
      await setProjectVisibility(token, project.id, next);
      onExtended({ ...project, visibility: next });
      showSuccess(next === 'SHARED_WITH_TEAM' ? t('projectDetail.sharedWithTeamToast') : t('projectDetail.madePrivateToast'));
    } catch (err) {
      showError(err instanceof Error ? err.message : t('projectDetail.couldNotUpdateSharing'));
    }
  }

  async function handleDeleteProject() {
    if (!token) return;
    try {
      await deleteProject(token, project.id);
      onDeleted(project.id);
      showSuccess(t('projectMenu.projectDeleted'));
    } catch (err) {
      showError(err instanceof Error ? err.message : t('projectMenu.couldNotDeleteProject'));
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
            aria-label={t('projectMenu.projectOptions')}
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
              <span>{t('projectMenu.summarizeProject')}</span>
              {locked && <LockBadge />}
            </DropdownMenu.Item>

            {segmentActionKey && (
              <DropdownMenu.Item
                onSelect={(e) => {
                  e.preventDefault();
                  loadFiles().then(handleAiAction);
                }}
                className={`flex cursor-pointer select-none items-center justify-between rounded-md px-2.5 py-2 text-[13px] outline-none transition-colors ${
                  locked ? 'text-ink opacity-45' : 'text-ink data-[highlighted]:bg-emerald-soft'
                }`}
              >
                <span>{t(segmentActionKey)}</span>
                {locked && <LockBadge />}
              </DropdownMenu.Item>
            )}

            <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />

            <DropdownMenu.Item
              onSelect={(e) => e.preventDefault()}
              onClick={() => setConfirmExtendDays(7)}
              className="cursor-pointer select-none rounded-md px-2.5 py-2 text-[13px] text-ink outline-none transition-colors data-[highlighted]:bg-emerald-soft"
            >
              {t('projectMenu.extendRetention7d')}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              onSelect={(e) => e.preventDefault()}
              onClick={() => setConfirmExtendDays(30)}
              className="cursor-pointer select-none rounded-md px-2.5 py-2 text-[13px] text-ink outline-none transition-colors data-[highlighted]:bg-emerald-soft"
            >
              {t('projectMenu.extendRetention30d')}
            </DropdownMenu.Item>

            <DropdownMenu.Sub
              open={filesSubOpen}
              onOpenChange={(next) => {
                setFilesSubOpen(next);
                if (next) loadFiles();
              }}
            >
              <DropdownMenu.SubTrigger className="flex cursor-pointer select-none items-center justify-between rounded-md px-2.5 py-2 text-[13px] text-ink outline-none transition-colors data-[highlighted]:bg-emerald-soft data-[state=open]:bg-emerald-soft">
                {t('projectMenu.deleteFileFromProject')}
                <span aria-hidden>›</span>
              </DropdownMenu.SubTrigger>
              <DropdownMenu.Portal>
                <DropdownMenu.SubContent
                  sideOffset={4}
                  className="animate-dropdown-in z-20 max-h-64 w-[220px] overflow-y-auto rounded-[10px] bg-white p-1.5 shadow-level-2"
                >
                  {!files ? (
                    <p className="px-2.5 py-2 text-[12px] text-ink-soft">{t('common.loading')}</p>
                  ) : files.length === 0 ? (
                    <p className="px-2.5 py-2 text-[12px] text-ink-soft">{t('projectMenu.noFiles')}</p>
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

            {project.teamId && (
              <>
                <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
                <DropdownMenu.Item
                  onSelect={(e) => {
                    e.preventDefault();
                    handleToggleVisibility();
                  }}
                  className="cursor-pointer select-none rounded-md px-2.5 py-2 text-[13px] text-ink outline-none transition-colors data-[highlighted]:bg-emerald-soft"
                >
                  {project.visibility === 'SHARED_WITH_TEAM' ? t('projectMenu.unshareFromTeam') : t('projectMenu.shareWithTeam')}
                </DropdownMenu.Item>
              </>
            )}

            <DropdownMenu.Separator className="my-1 h-px bg-gray-100" />
            <DropdownMenu.Item
              onSelect={(e) => {
                e.preventDefault();
                setConfirmOpen(true);
              }}
              className="cursor-pointer select-none rounded-md px-2.5 py-2 text-[13px] text-redline outline-none transition-colors data-[highlighted]:bg-red-50"
            >
              {t('projectMenu.permanentlyDeleteProject')}
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <Dialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="overlay-dim fixed inset-0 z-50" />
          <Dialog.Content className="animate-modal-in fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-level-4">
            <Dialog.Title className="font-serif text-lg font-semibold text-redline">{t('projectMenu.areYouSure')}</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-ink-soft">
              {t(project.documentCount === 1 ? 'projectMenu.deleteConfirmSingular' : 'projectMenu.deleteConfirmPlural')
                .replace('{name}', project.name)
                .replace('{n}', String(project.documentCount))}
            </Dialog.Description>
            <div className="mt-6 flex justify-end gap-3">
              <Dialog.Close asChild>
                <button className="text-sm font-medium text-ink-soft hover:text-ink">{t('settings.cancel')}</button>
              </Dialog.Close>
              <button
                onClick={handleDeleteProject}
                className="rounded-lg bg-redline px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                {t('projectMenu.deletePermanently')}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <RetentionConfirmDialog
        days={confirmExtendDays}
        onCancel={() => setConfirmExtendDays(null)}
        onConfirm={handleExtend}
      />
    </>
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
