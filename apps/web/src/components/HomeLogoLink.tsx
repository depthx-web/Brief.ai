'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { isTauri } from '@/lib/platform';

interface Props {
  className?: string;
  children: ReactNode;
}

// The desktop app deliberately skips the marketing homepage on launch (see
// tauri.conf.json's window `url`) — a logo link pointing at "/" would take a
// desktop user back to marketing content they were never shown in the first
// place. Used everywhere the brief.ai logo links home, so this decision
// lives in one place rather than 4 copies of the same ternary.
export default function HomeLogoLink({ className, children }: Props) {
  return (
    <Link href={isTauri() ? '/desktop-home' : '/'} className={className}>
      {children}
    </Link>
  );
}
