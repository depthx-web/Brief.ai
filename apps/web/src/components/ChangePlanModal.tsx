'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { fetchPlans, startCheckout, formatCents, type BillingCycle, type SegmentPricing } from '@/lib/billingApi';
import { showError, showSuccess } from '@/lib/toast';

const CYCLES: { value: BillingCycle; label: string }[] = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY', label: 'Yearly' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

// Workspace (segment) is locked at registration — see Settings.tsx —
// so this modal only ever changes the billing cycle/plan.
export default function ChangePlanModal({ open, onClose }: Props) {
  const { user, token } = useAuth();
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>('MONTHLY');
  const [pricing, setPricing] = useState<SegmentPricing[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSelectedCycle(user?.billingCycle ?? 'MONTHLY');
    fetchPlans()
      .then((res) => setPricing(res.plans))
      .catch(() => {});
  }, [open, user?.billingCycle]);

  if (!open) return null;

  const cyclesForSegment = pricing?.find((p) => p.segment === user?.segment)?.cycles;

  async function handleConfirm() {
    if (!token) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const switchingPlan = user?.plan !== 'PAID' || user?.billingCycle !== selectedCycle;
      if (switchingPlan) {
        try {
          const url = await startCheckout(token, selectedCycle);
          window.location.href = url;
          return;
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Could not start checkout.';
          setError(message);
          showError(message);
          return;
        }
      }

      showSuccess('Plan updated');
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not change your plan.';
      setError(message);
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="overlay-dim fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="animate-modal-in w-full max-w-[520px] rounded-[14px] bg-white p-8 shadow-level-4">
        <h2 className="font-serif text-xl font-semibold text-navy">Change your plan</h2>
        <p className="mt-1 text-sm text-ink-soft">Billing cycle for your current workspace.</p>

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

        {error && <p className="mt-4 text-sm text-redline">{error}</p>}

        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="rounded-lg bg-emerald px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSubmitting ? 'Updating…' : 'Confirm'}
          </button>
          <button onClick={onClose} className="text-sm font-medium text-ink-soft hover:text-ink">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
