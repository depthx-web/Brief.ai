'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { fetchPublicFeatures } from '@/lib/billingApi';
import { getCreditBalance } from '@/lib/creditsApi';
import type { Segment } from '@/lib/authApi';

// Mirrors the server-side FeatureGuard: PAID users always pass; a FREE user
// still passes if an admin toggled this exact feature's freeEnabled on
// (segment-scoped for AI tools, or the null-segment row for a tool
// available to every workspace), or if they have a spendable credit
// balance. Both sides read the same Feature rows so the UI and API never
// disagree about what's free — this replaced a blanket plan===PAID check
// that ignored both of those admin-controlled exceptions.
const BILLING_ENFORCED = process.env.NEXT_PUBLIC_BILLING_ENFORCED === 'true';

interface Props {
  featureKey: string;
  segment?: Segment;
  children: React.ReactNode;
}

export default function RequirePaidPlan({ featureKey, segment, children }: Props) {
  const { user, token, isLoading } = useAuth();
  const [freeEnabled, setFreeEnabled] = useState<boolean | null>(null);
  const [creditBalance, setCreditBalance] = useState<number | null>(null);

  useEffect(() => {
    fetchPublicFeatures()
      .then((features) => {
        const feature = features.find(
          (f) => f.key === featureKey && (segment ? f.segment === segment : f.segment === null)
        );
        setFreeEnabled(feature?.freeEnabled ?? false);
      })
      .catch(() => setFreeEnabled(false));
  }, [featureKey, segment]);

  useEffect(() => {
    if (!token) return;
    getCreditBalance(token)
      .then(setCreditBalance)
      .catch(() => {});
  }, [token]);

  if (!BILLING_ENFORCED) return <>{children}</>;
  if (isLoading || freeEnabled === null) return null;
  if (user?.plan === 'PAID') return <>{children}</>;
  if (user && freeEnabled) return <>{children}</>;
  if (user && (creditBalance ?? 0) > 0) return <>{children}</>;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <span className="inline-block rounded-md bg-navy-light px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-white">
        Pro
      </span>
      <h1 className="mt-4 font-serif text-2xl font-semibold text-navy">
        {user ? 'This tool needs a paid plan' : 'This tool needs an account'}
      </h1>
      <p className="mt-2 text-ink-soft">
        {user
          ? 'The free plan covers merge, split, rotate, organize, and other tools that run entirely in your browser. This one needs our servers, so it’s part of a paid workspace plan, or spend a pay-as-you-go credit.'
          : 'Create a free account to use this tool, then subscribe or buy credits if it needs more than the free plan covers.'}
      </p>
      <a
        href={user ? '/pricing' : '/signup'}
        className="mt-6 inline-block rounded-md bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark"
      >
        {user ? 'View plans' : 'Create free account'}
      </a>
    </div>
  );
}
