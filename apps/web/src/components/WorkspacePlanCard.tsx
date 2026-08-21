'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import type { Segment } from '@/lib/authApi';
import { getCreditBalance } from '@/lib/creditsApi';

const WORKSPACE_ICON: Record<Segment, string> = {
  LAWYER: '⚖️',
  ACCOUNTANT: '🧮',
  RESEARCHER: '📖',
};

const WORKSPACE_NAME: Record<Segment, string> = {
  LAWYER: 'Legal Workspace',
  ACCOUNTANT: 'Accounting Workspace',
  RESEARCHER: 'Research Workspace',
};

const CYCLE_LABEL: Record<string, string> = {
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  YEARLY: 'Yearly',
};

export default function WorkspacePlanCard({ onSwitchClick }: { onSwitchClick: () => void }) {
  const { user, token } = useAuth();
  const [creditBalance, setCreditBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    getCreditBalance(token)
      .then(setCreditBalance)
      .catch(() => {});
  }, [token]);

  if (!user?.segment) return null;

  const isPaid = user.plan === 'PAID';

  return (
    <div className="mx-3 my-3 rounded-[10px] bg-navy-light p-3.5">
      <p key={user.segment} className="fade-in-200 flex items-center gap-1.5 text-[13px] font-bold text-white">
        <span aria-hidden>{WORKSPACE_ICON[user.segment]}</span>
        {WORKSPACE_NAME[user.segment]}
      </p>
      <p
        key={`${user.plan}-${user.billingCycle}`}
        className={`fade-in-200 mt-1.5 inline-block rounded px-1.5 py-0.5 font-mono text-[10px] ${
          isPaid ? 'bg-emerald-soft/15 text-emerald-soft' : 'bg-white/10 text-[#C9D4E3]'
        }`}
      >
        {isPaid ? `${CYCLE_LABEL[user.billingCycle ?? 'MONTHLY']} · Active` : 'Free plan'}
      </p>
      {creditBalance !== null && creditBalance > 0 && (
        <Link href="/wallet" className="mt-1 block font-mono text-[10px] text-[#8FA1BC] hover:text-white">
          {creditBalance} credit{creditBalance === 1 ? '' : 's'} remaining →
        </Link>
      )}
      <button
        onClick={onSwitchClick}
        className="mt-2 block text-start text-xs font-medium text-emerald hover:text-white"
      >
        Change plan →
      </button>
    </div>
  );
}
