export type Os = 'windows' | 'mac' | 'linux' | 'unknown';

export function detectOs(): Os {
  if (typeof navigator === 'undefined') return 'unknown';
  // userAgentData isn't in the default DOM lib types yet — read it
  // defensively and fall back to the always-available platform/userAgent.
  const uaData = (navigator as unknown as { userAgentData?: { platform?: string } }).userAgentData;
  const raw = (uaData?.platform ?? navigator.platform ?? navigator.userAgent ?? '').toLowerCase();
  if (raw.includes('win')) return 'windows';
  if (raw.includes('mac')) return 'mac';
  if (raw.includes('linux') && !raw.includes('android')) return 'linux';
  return 'unknown';
}
