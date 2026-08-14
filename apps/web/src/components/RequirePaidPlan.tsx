'use client';

import { useAuth } from '@/lib/AuthContext';

// AI, OCR, and server-side conversion/protection tools are paid-only per the
// free plan spec — the free tier covers only tools that run entirely in the
// browser. Mirrors the server-side RequirePaidPlanGuard; both are gated by
// the same flag so the UI and API never disagree about what's free.
const BILLING_ENFORCED = process.env.NEXT_PUBLIC_BILLING_ENFORCED === 'true';

export default function RequirePaidPlan({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (!BILLING_ENFORCED) return <>{children}</>;
  if (isLoading) return null;
  if (user?.plan === 'PAID') return <>{children}</>;

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <span className="inline-block rounded-md bg-navy-light px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-white">
        Pro
      </span>
      <h1 className="mt-4 font-serif text-2xl font-semibold text-navy">This tool needs a paid plan</h1>
      <p className="mt-2 text-ink-soft">
        The free plan covers merge, split, rotate, organize, and other tools that run entirely in
        your browser. This one needs our servers, so it&apos;s part of a paid workspace plan.
      </p>
      <a
        href="/pricing"
        className="mt-6 inline-block rounded-md bg-emerald px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-dark"
      >
        View plans
      </a>
    </div>
  );
}
