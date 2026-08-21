'use client';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '@/lib/AuthContext';
import { isTauri } from '@/lib/platform';
import {
  getCreditBalance,
  listCreditTransactions,
  listCreditPacks,
  startCreditCheckout,
  formatCents,
  type CreditTransaction,
  type CreditPack,
} from '@/lib/creditsApi';
import { showError } from '@/lib/toast';
import { useLocale } from '@/lib/i18n/LocaleContext';
import type { DictionaryKey } from '@/lib/i18n/dictionaries/en';

const LOW_BALANCE_THRESHOLD = 3;

const REASON_COPY_KEY: Record<CreditTransaction['reason'], { labelKey: DictionaryKey; icon: string; iconClass: string }> = {
  PURCHASE: { labelKey: 'wallet.reasonPurchase', icon: '↓', iconClass: 'text-emerald' },
  AI_USAGE: { labelKey: 'wallet.reasonAiUsage', icon: '↑', iconClass: 'text-navy-light' },
  MANUAL_ADMIN_ADJUSTMENT: { labelKey: 'wallet.reasonManualAdjustment', icon: '↕', iconClass: 'text-amber-600' },
};

// delta 0 marks a PAID team member's usage tracked only for their team
// owner's monthly-usage/budget-cap view (Team Settings) — it never touches
// their wallet balance, so "0" alone would misleadingly read as a no-op.
function deltaLabel(delta: number, includedLabel: string): string {
  if (delta === 0) return includedLabel;
  return delta > 0 ? `+${delta}` : String(delta);
}
function deltaClass(delta: number): string {
  if (delta === 0) return 'text-ink-soft';
  return delta > 0 ? 'text-emerald' : 'text-navy';
}

export default function Wallet() {
  const { token } = useAuth();
  const { t, locale } = useLocale();
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[] | null>(null);
  const [buyOpen, setBuyOpen] = useState(false);

  useEffect(() => {
    if (!token) return;
    load(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  function load(currentToken: string) {
    getCreditBalance(currentToken).then(setBalance).catch(() => {});
    listCreditTransactions(currentToken).then(setTransactions).catch(() => {});
  }

  const desktop = isTauri();

  return (
    <div className={desktop ? 'px-9 py-7' : 'mx-auto max-w-2xl px-8 py-10'}>
      <h1 className="font-serif text-2xl font-medium text-navy">{desktop ? t('sidebar.wallet') : t('sidebar.myWallet')}</h1>

      <div
        className={`bg-gradient-to-br from-navy to-navy-light text-center text-white ${
          desktop ? 'mt-6 rounded-[14px] p-7' : 'mt-6 rounded-2xl p-8'
        }`}
      >
        <p className={`font-serif font-medium ${desktop ? 'text-4xl' : 'text-5xl'}`}>{balance ?? '—'}</p>
        <p className="mt-2 text-xs text-[#C9D4E3]">{t('wallet.availableBalance')}</p>
        <button
          onClick={() => setBuyOpen(true)}
          className="mt-6 rounded-lg bg-emerald px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-dark"
        >
          {t('wallet.buyMoreCredits')}
        </button>
        {balance !== null && balance < LOW_BALANCE_THRESHOLD && (
          <p className="mt-3 text-xs" style={{ color: '#D4A054' }}>
            {t('wallet.lowBalance')}
          </p>
        )}
      </div>

      {desktop && <UsageSparkline transactions={transactions} />}

      <div className="mt-10">
        <h2 className="font-serif text-lg font-semibold text-navy">{t('wallet.transactionHistory')}</h2>
        {!transactions ? (
          <p className="mt-3 text-sm text-ink-soft">{t('common.loading')}</p>
        ) : transactions.length === 0 ? (
          <div className="mt-3 rounded-xl border border-gray-200 bg-white px-6 py-10 text-center">
            <p className="text-sm text-ink-soft">{t('wallet.noTransactions')}</p>
          </div>
        ) : desktop ? (
          // Same flat-row pattern as the Recent panel — thin white card,
          // thin bottom border instead of full card separation.
          <div className="mt-3 overflow-hidden rounded-lg border border-paper-line bg-white">
            {transactions.map((tx, i) => {
              const copy = REASON_COPY_KEY[tx.reason];
              return (
                <div
                  key={tx.id}
                  className={`flex items-center gap-3 px-5 py-3 ${i < transactions.length - 1 ? 'border-b border-paper-line' : ''}`}
                >
                  <span className={`text-base ${copy.iconClass}`} aria-hidden>
                    {copy.icon}
                  </span>
                  <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-ink">
                    {tx.adminNote || t(copy.labelKey)}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-ink-soft">
                    {new Date(tx.createdAt).toLocaleDateString(locale)}
                  </span>
                  <span className={`w-12 shrink-0 text-end font-mono text-[13px] ${deltaClass(tx.delta)}`}>
                    {deltaLabel(tx.delta, t('wallet.included'))}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
            {transactions.map((tx) => {
              const copy = REASON_COPY_KEY[tx.reason];
              return (
                <li key={tx.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg ${copy.iconClass}`} aria-hidden>
                      {copy.icon}
                    </span>
                    <div>
                      <p className="text-sm text-ink">{tx.adminNote || t(copy.labelKey)}</p>
                      <p className="font-mono text-xs text-ink-soft">{new Date(tx.createdAt).toLocaleString(locale)}</p>
                    </div>
                  </div>
                  <span className={`font-mono text-sm ${deltaClass(tx.delta)}`}>
                    {deltaLabel(tx.delta, t('wallet.included'))}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <BuyCreditsModal
        open={buyOpen}
        onClose={() => setBuyOpen(false)}
      />
    </div>
  );
}

// Desktop-only: a 7-day usage sparkline, a nice touch for a power-user
// context. Skipped entirely (not an empty/fake chart) when there's no
// usage yet — genuinely simple, no chart library, just divs with
// proportional heights.
function UsageSparkline({ transactions }: { transactions: CreditTransaction[] | null }) {
  const { t, locale } = useLocale();
  if (!transactions) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const usageByDay = days.map((day) => {
    const next = new Date(day);
    next.setDate(next.getDate() + 1);
    return transactions
      .filter((t) => t.reason === 'AI_USAGE' && t.delta < 0)
      .filter((t) => {
        const created = new Date(t.createdAt);
        return created >= day && created < next;
      })
      .reduce((sum, t) => sum + Math.abs(t.delta), 0);
  });

  const hasUsage = usageByDay.some((n) => n > 0);
  if (!hasUsage) return null;

  const max = Math.max(...usageByDay);

  return (
    <div className="mt-4 rounded-xl bg-surface p-4">
      <p className="mb-3 text-[11px] text-ink-soft">{t('wallet.last7Days')}</p>
      <div className="flex items-end justify-between gap-2" style={{ height: 56 }}>
        {usageByDay.map((n, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
            <div
              className="w-full rounded-sm bg-emerald"
              style={{ height: `${Math.max((n / max) * 100, n > 0 ? 8 : 2)}%`, opacity: n > 0 ? 1 : 0.15 }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex justify-between gap-2">
        {days.map((d, i) => (
          <span key={i} className="flex-1 text-center font-mono text-[9px] text-ink-soft">
            {d.toLocaleDateString(locale, { weekday: 'narrow' })}
          </span>
        ))}
      </div>
    </div>
  );
}

function BuyCreditsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { token } = useAuth();
  const { t } = useLocale();
  const [packs, setPacks] = useState<CreditPack[] | null>(null);
  const [buyingPackId, setBuyingPackId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    listCreditPacks().then(setPacks).catch(() => setPacks([]));
  }, [open]);

  async function handleBuy(packId: string) {
    if (!token) return;
    setBuyingPackId(packId);
    try {
      const url = await startCreditCheckout(token, packId);
      window.location.href = url;
    } catch (err) {
      showError(err instanceof Error ? err.message : t('wallet.couldNotStartCheckout'));
    } finally {
      setBuyingPackId(null);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay-dim fixed inset-0 z-50" />
        <Dialog.Content className="animate-modal-in fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-7 shadow-level-4">
          <Dialog.Title className="font-serif text-xl font-medium text-navy">{t('wallet.buyMoreCredits')}</Dialog.Title>

          {!packs ? (
            <p className="mt-6 text-sm text-ink-soft">{t('common.loading')}</p>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {packs.map((pack) => (
                <div key={pack.id} className={`relative rounded-xl border p-5 ${pack.isBestValue ? 'border-emerald' : 'border-gray-200'}`}>
                  {pack.isBestValue && (
                    <span className="absolute -top-3 end-3 rounded-full bg-emerald-soft px-2 py-0.5 font-mono text-[9px] font-semibold text-emerald">
                      {t('wallet.bestValue')}
                    </span>
                  )}
                  <p className="font-serif text-base text-navy">{t('wallet.creditsCount').replace('{n}', String(pack.size))}</p>
                  <p className="mt-1 font-serif text-2xl font-medium text-navy">{formatCents(pack.priceCents)}</p>
                  <button
                    onClick={() => handleBuy(pack.id)}
                    disabled={buyingPackId !== null}
                    className="mt-4 block w-full rounded-lg bg-emerald px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    {buyingPackId === pack.id ? t('wallet.starting') : t('wallet.buy')}
                  </button>
                </div>
              ))}
            </div>
          )}

          <button onClick={onClose} className="mt-6 text-sm font-medium text-ink-soft hover:text-ink">
            {t('wallet.close')}
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
