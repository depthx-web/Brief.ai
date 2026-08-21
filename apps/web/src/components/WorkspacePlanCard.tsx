'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useLocale } from '@/lib/i18n/LocaleContext';
import type { DictionaryKey } from '@/lib/i18n/dictionaries/en';
import type { Segment } from '@/lib/authApi';
import { getCreditBalance } from '@/lib/creditsApi';

const WORKSPACE_ICON: Record<Segment, string> = {
  LAWYER: '⚖️',
  ACCOUNTANT: '🧮',
  RESEARCHER: '📖',
};

const WORKSPACE_NAME_KEY: Record<Segment, DictionaryKey> = {
  LAWYER: 'workspace.legalWorkspace',
  ACCOUNTANT: 'workspace.accountingWorkspace',
  RESEARCHER: 'workspace.researchWorkspace',
};

const CYCLE_LABEL_KEY: Record<string, DictionaryKey> = {
  WEEKLY: 'workspace.cycleWeekly',
  MONTHLY: 'workspace.cycleMonthly',
  QUARTERLY: 'workspace.cycleQuarterly',
  YEARLY: 'workspace.cycleYearly',
};

export default function WorkspacePlanCard({ onSwitchClick }: { onSwitchClick: () => void }) {
  const { user, token } = useAuth();
  const { t } = useLocale();
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
        {t(WORKSPACE_NAME_KEY[user.segment])}
      </p>
      <p
        key={`${user.plan}-${user.billingCycle}`}
        className={`fade-in-200 mt-1.5 inline-block rounded px-1.5 py-0.5 font-mono text-[10px] ${
          isPaid ? 'bg-emerald-soft/15 text-emerald-soft' : 'bg-white/10 text-[#C9D4E3]'
        }`}
      >
        {isPaid ? `${t(CYCLE_LABEL_KEY[user.billingCycle ?? 'MONTHLY'])} · ${t('workspace.active')}` : t('workspace.freePlan')}
      </p>
      {creditBalance !== null && creditBalance > 0 && (
        <Link href="/wallet" className="mt-1 block font-mono text-[10px] text-[#8FA1BC] hover:text-white">
          {t(creditBalance === 1 ? 'workspace.creditsRemainingSingular' : 'workspace.creditsRemainingPlural').replace('{n}', String(creditBalance))}
        </Link>
      )}
      <button
        onClick={onSwitchClick}
        className="mt-2 block text-start text-xs font-medium text-emerald hover:text-white"
      >
        {t('workspace.changePlan')}
      </button>
    </div>
  );
}
