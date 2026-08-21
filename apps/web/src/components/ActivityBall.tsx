'use client';

import { useEffect, useRef, useState } from 'react';
import { useActivityJobs, clearFinished, type ActivityJob } from '@/lib/activityStore';
import { CheckIcon, CloseIcon } from '@/lib/icons';
import { useLocale } from '@/lib/i18n/LocaleContext';

const CHECKMARK_AUTOHIDE_MS = 4000;

// Downloaded files land in the OS Downloads folder under their job filename
// (the browser-style `<a download>` click in convertApi.ts's downloadBlob
// triggers WebView2's normal download flow, same as a real browser) — this
// re-derives that path rather than storing one, since the folder is a fixed
// per-install location and doesn't need to be captured at completion time.
async function openDownloadedFile(filename: string) {
  try {
    const { open } = await import('@tauri-apps/plugin-shell');
    const { downloadDir, join } = await import('@tauri-apps/api/path');
    const path = await join(await downloadDir(), filename);
    await open(path);
  } catch {
    // The file may have been moved, renamed, or deleted since completion —
    // opening a downloaded file is a convenience, not worth surfacing an
    // error for.
  }
}

// Fixed bottom-right of the content area (not the sidebar) — hidden
// entirely when there's nothing to show, rather than a permanent empty
// button. See brief-ai-desktop-settings-wallet-notifications.md §3.1.
export default function ActivityBall() {
  const { t } = useLocale();
  const jobs = useActivityJobs();
  const [open, setOpen] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [acknowledgedFailures, setAcknowledgedFailures] = useState<Set<string>>(new Set());
  const wasRunning = useRef(false);
  const checkmarkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const running = jobs.filter((j) => j.status === 'running');
  const failed = jobs.filter((j) => j.status === 'failed');
  const unacknowledgedFailure = failed.some((j) => !acknowledgedFailures.has(j.id));

  // Fires the ~4s checkmark only on the running→all-finished transition,
  // never on every render — otherwise reopening the panel later would
  // re-trigger it.
  useEffect(() => {
    const isRunning = running.length > 0;
    if (wasRunning.current && !isRunning && !unacknowledgedFailure) {
      setShowCheckmark(true);
      if (checkmarkTimer.current) clearTimeout(checkmarkTimer.current);
      checkmarkTimer.current = setTimeout(() => setShowCheckmark(false), CHECKMARK_AUTOHIDE_MS);
    }
    wasRunning.current = isRunning;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running.length]);

  useEffect(() => () => {
    if (checkmarkTimer.current) clearTimeout(checkmarkTimer.current);
  }, []);

  function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next && failed.length > 0) {
      setAcknowledgedFailures((prev) => new Set([...prev, ...failed.map((j) => j.id)]));
    }
  }

  const visible = open || running.length > 0 || unacknowledgedFailure || showCheckmark;
  if (!visible) return null;

  return (
    <div className="fixed bottom-6 end-6 z-40 flex flex-col items-end gap-3">
      {open && <ActivityPanel jobs={jobs} onClose={() => setOpen(false)} />}

      <button
        onClick={handleToggle}
        aria-label={t('activity.label')}
        className="relative flex h-12 w-12 items-center justify-center rounded-full bg-navy shadow-level-3"
      >
        {running.length > 0 && (
          <span className="absolute inset-0 animate-spin rounded-full border-2 border-emerald border-t-transparent" />
        )}
        {running.length > 0 ? (
          <span className="font-mono text-xs font-semibold text-white">{running.length}</span>
        ) : unacknowledgedFailure ? (
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: '#C24444' }} />
        ) : (
          <CheckIcon size={18} color="#1E9D75" />
        )}
        {running.length > 1 && (
          <span className="absolute -end-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald font-mono text-[9px] font-bold text-white">
            {running.length}
          </span>
        )}
      </button>
    </div>
  );
}

function ActivityPanel({ jobs, onClose }: { jobs: ActivityJob[]; onClose: () => void }) {
  const { t } = useLocale();
  const hasFinished = jobs.some((j) => j.status !== 'running');

  return (
    <div className="w-80 overflow-hidden rounded-xl bg-white shadow-level-3">
      <div className="flex items-center justify-between border-b border-paper-line px-4 py-2.5">
        <span className="text-[13px] font-bold text-ink">{t('activity.label')}</span>
        <div className="flex items-center gap-3">
          {hasFinished && (
            <button
              onClick={() => clearFinished()}
              className="text-xs text-ink-soft hover:text-ink"
            >
              {t('activity.clearFinished')}
            </button>
          )}
          <button onClick={onClose} aria-label={t('common.close')} className="text-ink-soft hover:text-ink">
            <CloseIcon />
          </button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto p-3">
        {jobs.length === 0 ? (
          <p className="px-1 py-4 text-center text-[13px] text-ink-soft">{t('activity.nothingYet')}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {jobs.map((job) => (
              <JobRow key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function JobRow({ job }: { job: ActivityJob }) {
  const { t } = useLocale();
  const ext = job.filename.split('.').pop()?.toUpperCase() ?? 'FILE';
  return (
    <div className="rounded-lg border border-paper-line bg-paper p-3">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-navy-light text-[9px] font-bold text-white">
          {ext.slice(0, 4)}
        </span>
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-ink">{job.filename}</span>
      </div>

      {job.status === 'running' && (
        <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-paper-line">
          <span className="block h-full w-1/3 animate-pulse rounded-full bg-emerald" />
        </div>
      )}
      {job.status === 'done' && (
        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald">
            <CheckIcon size={12} />
            {t('activity.complete')}
          </div>
          <button
            onClick={() => openDownloadedFile(job.filename)}
            className="text-[11px] font-medium text-navy hover:text-emerald"
          >
            {t('activity.openFile')}
          </button>
        </div>
      )}
      {job.status === 'failed' && (
        <p className="mt-2 text-[11px]" style={{ color: '#C24444' }}>
          {job.error ?? t('activity.somethingWentWrong')}
        </p>
      )}
    </div>
  );
}
