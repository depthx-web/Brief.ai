import { useEffect, useState } from 'react';
import { useLocale } from './i18n/LocaleContext';
import type { DictionaryKey } from './i18n/dictionaries/en';

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
// (1h by default, 7d/30d if extended) nears zero. null means the
// file/project carries no expiry at all (e.g. an empty project, or an
// Unsorted document with no project).
function formatCountdown(expiresAt: string | Date | null, t: (key: DictionaryKey) => string): Countdown {
  if (expiresAt === null) return { label: t('countdown.noExpiry'), urgency: 'none' };
  const msLeft = new Date(expiresAt).getTime() - Date.now();

  if (msLeft <= 0) return { label: t('countdown.expired'), urgency: 'expired' };

  const hoursLeft = msLeft / (60 * 60 * 1000);
  const urgency: CountdownUrgency = hoursLeft <= 1 ? 'critical' : hoursLeft <= 6 ? 'soon' : 'plenty';

  if (hoursLeft >= 24) {
    const days = Math.ceil(hoursLeft / 24);
    return { label: t('countdown.daysLeft').replace('{n}', String(days)), urgency };
  }
  if (hoursLeft >= 1) {
    return { label: t('countdown.hoursLeft').replace('{n}', String(Math.ceil(hoursLeft))), urgency };
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
  const { t } = useLocale();
  const [countdown, setCountdown] = useState<Countdown>(() => formatCountdown(expiresAt, t));

  useEffect(() => {
    setCountdown(formatCountdown(expiresAt, t));
    if (expiresAt === null) return;

    const msLeft = new Date(expiresAt).getTime() - Date.now();
    if (msLeft <= 0) return;
    const intervalMs = msLeft <= 60 * 60 * 1000 ? 30_000 : 60_000;
    const id = setInterval(() => setCountdown(formatCountdown(expiresAt, t)), intervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt, t]);

  return countdown;
}
