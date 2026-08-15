'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { CATEGORY_ACCENT } from '@/lib/docTypes';
import { formatCountdown } from '@/lib/retentionCountdown';
import { getProject, type LibraryDocumentSummary, type ProjectSummary } from '@/lib/libraryApi';
import { showError } from '@/lib/toast';
import ProjectOptionsMenu from './ProjectOptionsMenu';
import FileOptionsMenu from './FileOptionsMenu';

const BADGE_CLASS = {
  plenty: 'bg-gray-100 text-ink-soft',
  soon: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-50 text-redline',
  expired: 'bg-gray-100 text-ink-soft/60',
} as const;

interface Props {
  project: ProjectSummary;
  onExtended: (project: ProjectSummary) => void;
  onDeleted: (id: string) => void;
  onUpgradeNeeded: () => void;
}

export default function ProjectCard({ project, onExtended, onDeleted, onUpgradeNeeded }: Props) {
  const { token, user } = useAuth();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [files, setFiles] = useState<LibraryDocumentSummary[] | null>(null);

  const accent = user?.segment ? CATEGORY_ACCENT[user.segment] : '#0F2340';
  const countdown = formatCountdown(project.expiresAt);

  async function toggleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (next && !files && token) {
      try {
        const detail = await getProject(token, project.id);
        setFiles(detail.documents);
      } catch (err) {
        showError(err instanceof Error ? err.message : 'Could not load this project.');
      }
    }
  }

  return (
    <div className="shadow-level-1 overflow-hidden rounded-[10px] border border-gray-200 bg-white transition-shadow hover:shadow-level-2">
      <div style={{ backgroundColor: accent }} className="h-1" aria-hidden />
      <div className="cursor-pointer p-4" onClick={toggleExpand}>
        <div className="flex items-start justify-between gap-2">
          <span aria-hidden className="text-base leading-none text-ink-soft">
            📎
          </span>
          <div className="flex items-center gap-1">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${BADGE_CLASS[countdown.urgency]}`}
            >
              {countdown.label}
            </span>
            <ProjectOptionsMenu
              project={project}
              onExtended={onExtended}
              onDeleted={onDeleted}
              onUpgradeNeeded={onUpgradeNeeded}
            />
          </div>
        </div>
        <p className="mt-3 truncate font-serif text-base text-navy">{project.name}</p>
        <p className="mt-1 font-mono text-xs text-ink-soft">
          {project.documentCount} file{project.documentCount === 1 ? '' : 's'}
        </p>
      </div>

      {expanded && (
        <div className="fade-in-200 border-t border-gray-100 px-4 py-3">
          {!files ? (
            <p className="text-xs text-ink-soft">Loading…</p>
          ) : files.length === 0 ? (
            <p className="text-xs text-ink-soft">No files in this project.</p>
          ) : (
            <ul className="space-y-1.5">
              {files.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between gap-2 rounded-md px-1.5 py-1 hover:bg-gray-50"
                >
                  <button
                    onClick={() => router.push(`/workspace?doc=${f.id}`)}
                    className="truncate text-left font-mono text-xs text-ink hover:text-emerald"
                  >
                    {f.filename}
                  </button>
                  <FileOptionsMenu
                    doc={f}
                    onRenamed={(updated) => setFiles((prev) => prev?.map((d) => (d.id === updated.id ? updated : d)) ?? null)}
                    onDeleted={(id) => setFiles((prev) => prev?.filter((d) => d.id !== id) ?? null)}
                    onUpgradeNeeded={onUpgradeNeeded}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
