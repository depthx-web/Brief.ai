'use client';

import type { ReactNode } from 'react';
import { isTauri } from '@/lib/platform';
import type { Segment } from '@/lib/authApi';
import RequirePaidPlan from './RequirePaidPlan';

interface Props {
  featureKey: string;
  segment?: Segment;
  children: ReactNode;
}

// These tools run against a local Rust command (see convertApi.ts's
// isTauri() branch) on desktop, incurring no server cost — only the web
// build needs the paywall. Kept as a separate client component (rather than
// checking isTauri() in each page.tsx directly) since every server-backed
// tool page repeats this exact wrap/don't-wrap decision.
export default function LocalOrPaidGate({ featureKey, segment, children }: Props) {
  if (isTauri()) return <>{children}</>;
  return (
    <RequirePaidPlan featureKey={featureKey} segment={segment}>
      {children}
    </RequirePaidPlan>
  );
}
