'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import type { Segment } from '@/lib/authApi';
import { fetchPlans, startCheckout, formatCents, type BillingCycle, type SegmentPricing } from '@/lib/billingApi';
import { showError, showSuccess } from '@/lib/toast';

const SEGMENTS: { value: Segment; label: string; description: string }[] = [
  { value: 'LAWYER', label: 'Lawyer', description: 'Contracts, redlines, clause review' },
  { value: 'ACCOUNTANT', label: 'Accountant', description: 'Invoices, statements, exports' },
  { value: 'RESEARCHER', label: 'Researcher', description: 'Papers, citations, chat' },
];

const ICONS: Record<Segment, JSX.Element> = {
  LAWYER: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path
        d="M12 3v18M5 8l-3 6a3 3 0 0 0 6 0l-3-6ZM19 8l-3 6a3 3 0 0 0 6 0l-3-6ZM5 8h14M9 21h6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  ACCOUNTANT: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <path
        d="M8 6h8M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"
        strokeLinecap="round"
      />
    </svg>
  ),
  RESEARCHER: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="10" cy="10" r="6" />
      <path d="M21 21l-5.2-5.2" strokeLinecap="round" />
    </svg>
  ),
};

const CYCLES: { value: BillingCycle; label: string }[] = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY', label: 'Yearly' },
];

interface Props {
  open: boolean;
  initialStep: 'workspace' | 'cycle';
  onClose: () => void;
}

export default function SwitchWorkspaceModal({ open, initialStep, onClose }: Props) {
  const { user, token, updateProfile } = useAuth();
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>('MONTHLY');
  const [pricing, setPricing] = useState<SegmentPricing[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSelectedSegment(initialStep === 'cycle' ? user?.segment ?? null : user?.segment ?? null);
    setSelectedCycle(user?.billingCycle ?? 'MONTHLY');
    fetchPlans()
      .then((res) => setPricing(res.plans))
      .catch(() => {});
  }, [open, initialStep, user?.segment, user?.billingCycle]);

  if (!open) return null;

  const cyclesForSegment = pricing?.find((p) => p.segment === selectedSegment)?.cycles;

  async function handleConfirm() {
    if (!selectedSegment || !token) return;
    setIsSubmitting(true);
    setError(null);
    try {
      if (selectedSegment !== user?.segment) {
        await updateProfile({ segment: selectedSegment });
      }

      const switchingPlan = user?.plan !== 'PAID' || user?.billingCycle !== selectedCycle;
      if (switchingPlan) {
        try {
          const url = await startCheckout(token, selectedCycle);
          window.location.href = url;
          return;
        } catch (err) {
          // Billing not configured yet — the workspace switch above still
          // applies, so tell the user plainly rather than blocking it.
          const message = err instanceof Error ? err.message : 'Could not start checkout.';
          setError(message);
          showError(message);
          return;
        }
      }

      showSuccess('Workspace updated');
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not switch workspace.';
      setError(message);
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="overlay-dim fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="animate-modal-in w-full max-w-[640px] rounded-[14px] bg-white p-8 shadow-level-4">
        <h2 className="font-serif text-xl font-semibold text-navy">Switch your workspace or plan</h2>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {SEGMENTS.map((s) => {
            const selected = selectedSegment === s.value;
            const isCurrent = user?.segment === s.value;
            return (
              <button
                key={s.value}
                type="button"
                onClick={() => setSelectedSegment(s.value)}
                className={`relative rounded-xl border-2 p-4 text-left transition-colors ${
                  selected ? 'border-emerald' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {isCurrent && (
                  <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-emerald text-[11px] text-white">
                    ✓
                  </span>
                )}
                <span className="mb-3 flex h-8 w-8 items-center justify-center text-navy">{ICONS[s.value]}</span>
                <p className="font-serif text-base font-semibold text-navy">{s.label}</p>
                <p className="mt-1 text-xs text-ink-soft">{s.description}</p>
              </button>
            );
          })}
        </div>

        {selectedSegment && (
          <div className="fade-in-200 mt-6">
            <p className="text-sm font-medium text-ink">Billing cycle</p>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {CYCLES.map((c) => {
                const active = selectedCycle === c.value;
                const cyclePrice = cyclesForSegment?.find((p) => p.cycle === c.value);
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setSelectedCycle(c.value)}
                    className={`relative rounded-md border px-2 py-2.5 text-center text-xs font-medium transition-colors ${
                      active ? 'border-emerald bg-emerald text-white' : 'border-gray-200 text-ink-soft hover:border-gray-300'
                    }`}
                  >
                    {(c.value === 'QUARTERLY' || c.value === 'YEARLY') && (
                      <span className="absolute -top-2 right-1 rounded bg-amber-400 px-1 py-0.5 font-mono text-[9px] font-semibold text-navy">
                        Save {c.value === 'QUARTERLY' ? '10%' : '20%'}
                      </span>
                    )}
                    {c.label}
                    {cyclePrice && (
                      <span className="mt-0.5 block font-mono text-[10px] opacity-80">
                        {formatCents(cyclePrice.priceCents)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {error && <p className="mt-4 text-sm text-redline">{error}</p>}

        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={handleConfirm}
            disabled={!selectedSegment || isSubmitting}
            className="rounded-lg bg-emerald px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting ? 'Switching…' : 'Confirm switch'}
          </button>
          <button onClick={onClose} className="text-sm font-medium text-ink-soft hover:text-ink">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
