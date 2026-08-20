import { useEffect, useState } from 'react';

export type CountdownUrgency = 'plenty' | 'soon' | 'critical' | 'expired' | 'none';

export interface Countdown {
  label: string;
  urgency: CountdownUrgency;
}

// Shared badge styling for every countdown display (ProjectCard, ProjectDetail, MyLibrary).
export const COUNTDOWN_BADGE_CLASS: Record<CountdownUrgency, string> = {
  plenty: 'bg-gray-100 text-ink-soft',
  soon: 'bg-amber-100 text-amber-700',
  critical: 'bg-red-50 text-redline',
  expired: 'bg-gray-100 text-ink-soft/60',
  none: 'bg-gray-100 text-ink-soft/60',
};

// Drives the Library project/file countdown badge — plain gray with plenty
// of time left, ambering, then reading redline as the retention window
// (24h by default, 7d/30d if extended) nears zero. null means the
// file/project carries no expiry at all (e.g. an empty project, or an
// Unsorted document with no project).
export function formatCountdown(expiresAt: string | Date | null): Countdown {
  if (expiresAt === null) return { label: 'No expiry', urgency: 'none' };
  const msLeft = new Date(expiresAt).getTime() - Date.now();

  if (msLeft <= 0) return { label: 'Expired', urgency: 'expired' };

  const hoursLeft = msLeft / (60 * 60 * 1000);
  const urgency: CountdownUrgency = hoursLeft <= 1 ? 'critical' : hoursLeft <= 6 ? 'soon' : 'plenty';

  if (hoursLeft >= 24) {
    const days = Math.ceil(hoursLeft / 24);
    return { label: `${days}d left`, urgency };
  }
  if (hoursLeft >= 1) {
    return { label: `${Math.ceil(hoursLeft)}h left`, urgency };
  }
  const totalMinutes = Math.max(1, Math.ceil(msLeft / (60 * 1000)));
  const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const mm = String(totalMinutes % 60).padStart(2, '0');
  return { label: `${hh}:${mm}`, urgency };
}

// Live-ticking version of formatCountdown — without this, a badge computed
// once at render time freezes (e.g. stays "58m left" forever instead of
// counting down to deletion). Ticks every 30s once under an hour remains
// (so the minutes figure stays accurate), otherwise every 60s.
export function useCountdown(expiresAt: string | Date | null): Countdown {
  const [countdown, setCountdown] = useState<Countdown>(() => formatCountdown(expiresAt));

  useEffect(() => {
    setCountdown(formatCountdown(expiresAt));
    if (expiresAt === null) return;

    const msLeft = new Date(expiresAt).getTime() - Date.now();
    if (msLeft <= 0) return;
    const intervalMs = msLeft <= 60 * 60 * 1000 ? 30_000 : 60_000;
    const id = setInterval(() => setCountdown(formatCountdown(expiresAt)), intervalMs);
    return () => clearInterval(id);
  }, [expiresAt]);

  return countdown;
}
