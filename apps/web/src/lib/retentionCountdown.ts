export type CountdownUrgency = 'plenty' | 'soon' | 'critical' | 'expired';

export interface Countdown {
  label: string;
  urgency: CountdownUrgency;
}

// Drives the Library project card's countdown badge — plain gray with
// plenty of time left, ambering, then reading redline as the retention
// window (24h by default, 7d/30d if extended) nears zero.
export function formatCountdown(expiresAt: string | Date): Countdown {
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
  const minutes = Math.max(1, Math.ceil(msLeft / (60 * 1000)));
  return { label: `${minutes}m left`, urgency };
}
