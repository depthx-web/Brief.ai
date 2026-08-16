'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { getProject, renameProject, type ProjectDetail as ProjectDetailData } from '@/lib/libraryApi';
import { formatCountdown } from '@/lib/retentionCountdown';
import { CATEGORY_ACCENT } from '@/lib/docTypes';
import { showError, showSuccess } from '@/lib/toast';
import FileOptionsMenu from './FileOptionsMenu';
import AddFilesToProjectDialog from './AddFilesToProjectDialog';
import SwitchWorkspaceModal from './SwitchWorkspaceModal';

const COUNTDOWN_BADGE_CLASS = {
  plenty: 'bg-gray-100 text-ink-soft',
  soon: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-50 text-redline',
  expired: 'bg-gray-100 text-ink-soft/60',
  none: 'bg-gray-100 text-ink-soft/60',
} as const;

export default function ProjectDetail({ projectId }: { projectId: string }) {
  const { token, user } = useAuth();
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
      setError(err instanceof Error ? err.message : 'Could not load this project.');
    } finally {
      setIsLoading(false);
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
      showSuccess('Saved successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not rename this project.');
      setNameDraft(project.name);
    }
  }

  if (isLoading) {
    return <div className="mx-auto max-w-5xl px-8 py-10 text-sm text-ink-soft">Loading…</div>;
  }

  if (error || !project) {
    return (
      <div className="mx-auto max-w-5xl px-8 py-10">
        <p className="text-sm text-redline">{error ?? 'Project not found.'}</p>
        <button onClick={() => router.push('/library')} className="mt-4 text-sm font-medium text-navy hover:text-emerald">
          ← Back to Library
        </button>
      </div>
    );
  }

  const accent = user?.segment ? CATEGORY_ACCENT[user.segment] : '#0F2340';
  const nearestExpiresAt =
    project.documents
      .map((d) => d.expiresAt)
      .filter((d): d is string => d !== null)
      .sort()[0] ?? null;
  const countdown = formatCountdown(nearestExpiresAt);

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/library')} className="text-ink-soft hover:text-ink" aria-label="Back to Library">
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
          <button onClick={() => setIsEditingName(true)} className="font-serif text-2xl font-medium text-navy hover:text-emerald" title="Click to rename">
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
          <span className="text-sm text-ink-soft">Add files to this project</span>
        </button>

        {project.documents.map((doc) => {
          const fileCountdown = formatCountdown(doc.expiresAt);
          return (
            <div key={doc.id} className="shadow-level-1 flex flex-col rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <button onClick={() => router.push(`/workspace?doc=${doc.id}`)} className="min-w-0 text-left">
                  <p className="truncate font-mono text-sm text-ink hover:text-emerald">{doc.filename}</p>
                </button>
                <FileOptionsMenu
                  doc={doc}
                  onRenamed={(updated) =>
                    setProject((prev) =>
                      prev ? { ...prev, documents: prev.documents.map((d) => (d.id === updated.id ? { ...d, ...updated } : d)) } : prev
                    )
                  }
                  onDeleted={(id) =>
                    setProject((prev) => (prev ? { ...prev, documents: prev.documents.filter((d) => d.id !== id) } : prev))
                  }
                  onUpgradeNeeded={() => setUpgradeModalOpen(true)}
                />
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-xs text-ink-soft">{new Date(doc.createdAt).toLocaleDateString()}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${COUNTDOWN_BADGE_CLASS[fileCountdown.urgency]}`}
                >
                  {fileCountdown.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <AddFilesToProjectDialog
        open={addFilesOpen}
        projectId={project.id}
        category={project.category}
        onClose={() => setAddFilesOpen(false)}
        onUploaded={() => token && load(token)}
      />
      <SwitchWorkspaceModal open={upgradeModalOpen} initialStep="cycle" onClose={() => setUpgradeModalOpen(false)} />
    </div>
  );
}
