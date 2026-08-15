'use client';

import { useAuth } from '@/lib/AuthContext';

// Shown below the download button after a successful free-tool operation
// (Batch 4, Section 3) — calm, not a popup, and only for guests since a
// signed-in user already has everything it's offering.
export default function GuestEncouragementBar() {
  const { user } = useAuth();
  if (user) return null;

  return (
    <div className="fade-in-200 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-emerald-soft px-4 py-3">
      <p className="text-sm text-ink">Create a free account to save your files and unlock AI tools</p>
      <a href="/signup" className="text-sm font-semibold text-emerald-dark hover:underline">
        Sign up free →
      </a>
    </div>
  );
}
