'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { getProject, renameProject, type ProjectDetail as ProjectDetailData, type LibraryDocumentSummary } from '@/lib/libraryApi';
import { COUNTDOWN_BADGE_CLASS, useCountdown } from '@/lib/retentionCountdown';
import { CATEGORY_ACCENT } from '@/lib/docTypes';
import { setProjectVisibility } from '@/lib/teamApi';
import { showError, showSuccess } from '@/lib/toast';
import { useLocale } from '@/lib/i18n/LocaleContext';
import FileOptionsMenu from './FileOptionsMenu';
import AddFilesToProjectDialog from './AddFilesToProjectDialog';
import ChangePlanModal from './ChangePlanModal';

export default function ProjectDetail({ projectId }: { projectId: string }) {
  const { token, user } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [project, setProject] = useState<ProjectDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState('');
  const [addFilesOpen, setAddFilesOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    load(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, projectId]);

  async function load(currentToken: string) {
    setIsLoading(true);
    setError(null);
    try {
      const detail = await getProject(currentToken, projectId);
      setProject(detail);
      setNameDraft(detail.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('projectDetail.couldNotLoad'));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleVisibility() {
    if (!token || !project?.teamId) return;
    const next = project.visibility === 'PRIVATE' ? 'SHARED_WITH_TEAM' : 'PRIVATE';
    try {
      await setProjectVisibility(token, project.id, next);
      setProject((prev) => (prev ? { ...prev, visibility: next } : prev));
      showSuccess(next === 'SHARED_WITH_TEAM' ? t('projectDetail.sharedWithTeamToast') : t('projectDetail.madePrivateToast'));
    } catch (err) {
      showError(err instanceof Error ? err.message : t('projectDetail.couldNotUpdateSharing'));
    }
  }

  async function handleNameSave() {
    setIsEditingName(false);
    if (!token || !project || !nameDraft.trim() || nameDraft === project.name) {
      setNameDraft(project?.name ?? '');
      return;
    }
    try {
      await renameProject(token, project.id, nameDraft.trim());
      setProject((prev) => (prev ? { ...prev, name: nameDraft.trim() } : prev));
      showSuccess(t('projectDetail.savedSuccess'));
    } catch (err) {
      showError(err instanceof Error ? err.message : t('projectDetail.couldNotRename'));
      setNameDraft(project.name);
    }
  }

  // Hooks must run unconditionally on every render, so this is computed
  // before the loading/error early returns below rather than after them.
  const nearestExpiresAt =
    project?.documents
      .map((d) => d.expiresAt)
      .filter((d): d is string => d !== null)
      .sort()[0] ?? null;
  const countdown = useCountdown(nearestExpiresAt);

  if (isLoading) {
    return <div className="mx-auto max-w-5xl px-8 py-10 text-sm text-ink-soft">{t('common.loading')}</div>;
  }

  if (error || !project) {
    return (
      <div className="mx-auto max-w-5xl px-8 py-10">
        <p className="text-sm text-redline">{error ?? t('projectDetail.notFound')}</p>
        <button onClick={() => router.push('/library')} className="mt-4 text-sm font-medium text-navy hover:text-emerald">
          {t('projectDetail.backToLibrary')}
        </button>
      </div>
    );
  }

  const accent = user?.segment ? CATEGORY_ACCENT[user.segment] : '#0F2340';

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/library')} className="text-ink-soft hover:text-ink" aria-label={t('projectDetail.backToLibrary')}>
          ←
        </button>

        {isEditingName ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            onBlur={handleNameSave}
            onKeyDown={(e) => e.key === 'Enter' && (e.currentTarget as HTMLInputElement).blur()}
            className="rounded-md border border-emerald px-2 py-1 font-serif text-2xl font-medium text-navy outline-none"
          />
        ) : (
          <button onClick={() => setIsEditingName(true)} className="font-serif text-2xl font-medium text-navy hover:text-emerald" title={t('projectDetail.clickToRename')}>
            {project.name}
          </button>
        )}

        {project.category && (
          <span
            style={{ backgroundColor: `${accent}1A`, color: accent }}
            className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
          >
            {project.category}
          </span>
        )}

        {project.teamId && (
          <button
            onClick={handleToggleVisibility}
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
              project.visibility === 'SHARED_WITH_TEAM' ? 'bg-emerald-soft text-emerald' : 'bg-gray-100 text-ink-soft'
            }`}
          >
            {project.visibility === 'SHARED_WITH_TEAM' ? t('projectDetail.sharedWithTeam') : t('projectDetail.privateShareWithTeam')}
          </button>
        )}

        <span
          className={`ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${COUNTDOWN_BADGE_CLASS[countdown.urgency]}`}
        >
          {countdown.label}
        </span>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <button
          onClick={() => setAddFilesOpen(true)}
          className="flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-navy-light/40 bg-white/60 text-center transition-colors hover:border-emerald hover:shadow-level-1 sm:aspect-auto sm:min-h-[132px]"
        >
          <span className="text-[28px] leading-none text-emerald">+</span>
          <span className="text-sm text-ink-soft">{t('projectDetail.addFiles')}</span>
        </button>

        {project.documents.map((doc) => (
          <ProjectDocumentCard
            key={doc.id}
            doc={doc}
            onOpen={() => router.push(`/workspace?doc=${doc.id}`)}
            onRenamed={(updated) =>
              setProject((prev) =>
                prev ? { ...prev, documents: prev.documents.map((d) => (d.id === updated.id ? { ...d, ...updated } : d)) } : prev
              )
            }
            onDeleted={(id) => setProject((prev) => (prev ? { ...prev, documents: prev.documents.filter((d) => d.id !== id) } : prev))}
            onDuplicated={(copy) => setProject((prev) => (prev ? { ...prev, documents: [copy, ...prev.documents] } : prev))}
            onUpgradeNeeded={() => setUpgradeModalOpen(true)}
          />
        ))}
      </div>

      <AddFilesToProjectDialog
        open={addFilesOpen}
        projectId={project.id}
        category={project.category}
        defaultRetentionHours={user?.defaultRetentionHours}
        onClose={() => setAddFilesOpen(false)}
        onUploaded={() => token && load(token)}
      />
      <ChangePlanModal open={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} />
    </div>
  );
}

function ProjectDocumentCard({
  doc,
  onOpen,
  onRenamed,
  onDeleted,
  onDuplicated,
  onUpgradeNeeded,
}: {
  doc: LibraryDocumentSummary;
  onOpen: () => void;
  onRenamed: (updated: LibraryDocumentSummary) => void;
  onDeleted: (id: string) => void;
  onDuplicated: (doc: LibraryDocumentSummary) => void;
  onUpgradeNeeded: () => void;
}) {
  const countdown = useCountdown(doc.expiresAt);
  const { locale } = useLocale();

  return (
    <div className="shadow-level-1 flex flex-col rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <button onClick={onOpen} className="min-w-0 text-start">
          <p className="truncate font-mono text-sm text-ink hover:text-emerald">{doc.filename}</p>
        </button>
        <FileOptionsMenu
          doc={doc}
          onRenamed={onRenamed}
          onDeleted={onDeleted}
          onDuplicated={onDuplicated}
          onUpgradeNeeded={onUpgradeNeeded}
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-xs text-ink-soft">{new Date(doc.createdAt).toLocaleDateString(locale)}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${COUNTDOWN_BADGE_CLASS[countdown.urgency]}`}
        >
          {countdown.label}
        </span>
      </div>
    </div>
  );
}
