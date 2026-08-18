'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Os = 'windows' | 'mac' | 'linux' | 'unknown';

const OS_LABEL: Record<Os, string> = {
  windows: 'Download for Windows',
  mac: 'Download for Mac',
  linux: 'Download for Linux',
  // Unrecognized/mobile visitor — default to the largest likely desktop
  // audience rather than guess further.
  unknown: 'Download for Windows',
};

function detectOs(): Os {
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

export default function DesktopAppSection() {
  const [os, setOs] = useState<Os>('unknown');

  useEffect(() => {
    setOs(detectOs());
  }, []);

  return (
    <section id="desktop-app" className="bg-surface px-6 py-24 sm:px-12">
      <div className="mx-auto grid max-w-[1180px] items-center gap-14 lg:grid-cols-2">
        <div>
          <div className="mb-3.5 font-mono text-xs uppercase tracking-wider text-emerald">Desktop App</div>
          <h2 className="mb-4 max-w-md font-serif text-3xl font-medium leading-tight text-navy sm:text-4xl">
            Also built for your desktop
          </h2>
          <p className="mb-8 max-w-[440px] text-base leading-relaxed text-ink-soft">
            Core tools run entirely on your machine — no upload, no internet required. Sign in when
            you want AI features; work offline the rest of the time.
          </p>

          <Link
            href="/download"
            className="inline-flex items-center gap-3 rounded-md bg-emerald px-7 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(30,157,117,0.4)]"
          >
            <OsIcon os={os} />
            {OS_LABEL[os]}
          </Link>

          <p className="mt-4 flex items-center gap-1.5 text-[13px] text-ink-soft">
            <LockIcon />
            Signed installer · Same privacy guarantees as the web app
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          <div
            className="w-full max-w-[520px] overflow-hidden rounded-xl bg-white shadow-level-3"
            style={{ transform: 'rotate(-1deg)' }}
          >
            <div className="grid h-8 grid-cols-[1fr_auto_1fr] items-center bg-surface px-3">
              <div className="flex gap-1.5">
                <WindowControls os={os} />
              </div>
              <span className="text-xs text-ink-soft">Brief.ai</span>
              <span />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/desktop-app-home.png" alt="Brief.ai desktop app — Home screen" className="block w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}

// Decorative only — adapts dots-vs-min/max/close to the detected OS so the
// mockup reads as a real cross-platform app, not a single hardcoded chrome.
function WindowControls({ os }: { os: Os }) {
  if (os === 'mac') {
    return (
      <>
        <span className="h-2.5 w-2.5 rounded-full bg-ink-soft/25" />
        <span className="h-2.5 w-2.5 rounded-full bg-ink-soft/25" />
        <span className="h-2.5 w-2.5 rounded-full bg-ink-soft/25" />
      </>
    );
  }
  return (
    <svg width="42" height="10" viewBox="0 0 42 10" fill="none" stroke="currentColor" strokeWidth={1.2} className="text-ink-soft/40" aria-hidden>
      <path d="M1 5h6" />
      <rect x="17" y="1" width="6" height="6" />
      <path d="M33 1l6 6M39 1l-6 6" />
    </svg>
  );
}

function OsIcon({ os }: { os: Os }) {
  if (os === 'mac') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M16.5 1c.1 1.1-.3 2.2-1 3-.7.8-1.9 1.5-3 1.4-.1-1.1.4-2.3 1-3C14.2 1.6 15.4 1 16.5 1zM20.6 17.4c-.5 1.1-.7 1.6-1.4 2.6-.9 1.4-2.2 3.1-3.8 3.1-1.4 0-1.8-.9-3.7-.9s-2.4.9-3.7.9c-1.6 0-2.8-1.6-3.7-2.9-2.5-3.7-2.8-8.1-1.2-10.4 1.1-1.6 2.9-2.6 4.5-2.6 1.7 0 2.7 1 4.1 1 1.3 0 2.1-1 4.1-1 1.4 0 2.9.8 3.9 2.1-3.5 1.9-2.9 6.9 1 8.1z" />
      </svg>
    );
  }
  // Windows logo (four-pane) covers both the detected-Windows and
  // unrecognized-OS default cases.
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M3 5.5 10.5 4.4v6.9H3zM11.4 4.3 21 3v8.3h-9.6zM3 12.4h7.5v6.9L3 18.2zM11.4 12.4H21V21l-9.6-1.3z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}
