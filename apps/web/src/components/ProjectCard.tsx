'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { CATEGORY_ACCENT } from '@/lib/docTypes';
import { COUNTDOWN_BADGE_CLASS, useCountdown } from '@/lib/retentionCountdown';
import { useLocale } from '@/lib/i18n/LocaleContext';
import type { ProjectSummary } from '@/lib/libraryApi';
import ProjectOptionsMenu from './ProjectOptionsMenu';

interface Props {
  project: ProjectSummary;
  onExtended: (project: ProjectSummary) => void;
  onDeleted: (id: string) => void;
  onUpgradeNeeded: () => void;
}

// Clicking the card body opens the project's detail page (Part 8) — the
// "⋯" trigger inside ProjectOptionsMenu is the only way to reach the quick
// actions menu now, instead of the two interactions being merged.
export default function ProjectCard({ project, onExtended, onDeleted, onUpgradeNeeded }: Props) {
  const { user } = useAuth();
  const { t } = useLocale();
  const router = useRouter();

  const accent = user?.segment ? CATEGORY_ACCENT[user.segment] : '#0F2340';
  const countdown = useCountdown(project.nearestExpiresAt);

  return (
    <div className="shadow-level-1 overflow-hidden rounded-[10px] border border-gray-200 bg-white transition-shadow hover:shadow-level-2">
      <div style={{ backgroundColor: accent }} className="h-1" aria-hidden />
      <div
        role="button"
        tabIndex={0}
        onClick={() => router.push(`/library?projectId=${project.id}`)}
        onKeyDown={(e) => e.key === 'Enter' && router.push(`/library?projectId=${project.id}`)}
        className="w-full cursor-pointer p-4 text-start"
      >
        <div className="flex items-start justify-between gap-2">
          <span aria-hidden className="text-base leading-none text-ink-soft">
            📎
          </span>
          <div className="flex items-center gap-1">
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${COUNTDOWN_BADGE_CLASS[countdown.urgency]}`}
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
          {t(project.documentCount === 1 ? 'library.fileCountBareSingular' : 'library.fileCountBarePlural').replace('{n}', String(project.documentCount))}
        </p>
      </div>
    </div>
  );
}
