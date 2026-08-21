'use client';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '@/lib/AuthContext';
import {
  fetchAffiliateMe,
  requestAffiliatePayout,
  formatCents,
  type AffiliateMe,
  type PayoutMethod,
} from '@/lib/affiliateApi';
import { showError, showSuccess } from '@/lib/toast';
import { useLocale } from '@/lib/i18n/LocaleContext';

export default function ReferralProgram() {
  const { token } = useAuth();
  const { t, locale } = useLocale();
  const [data, setData] = useState<AffiliateMe | null>(null);
  const [copied, setCopied] = useState(false);
  const [payoutOpen, setPayoutOpen] = useState(false);

  function load() {
    if (!token) return;
    fetchAffiliateMe(token).then(setData).catch(() => {});
  }

  useEffect(load, [token]);

  async function handleCopy() {
    if (!data) return;
    await navigator.clipboard.writeText(data.referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!data) return <div className="mx-auto max-w-2xl px-8 py-10 text-sm text-ink-soft">{t('common.loading')}</div>;

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <h1 className="font-serif text-2xl font-medium text-navy">{t('sidebar.referrals')}</h1>

      <div className="mt-6 rounded-2xl bg-gradient-to-br from-navy to-navy-light p-8 text-white">
        <p className="text-sm text-[#C9D4E3]">{t('referral.yourLink')}</p>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 truncate rounded-lg bg-[rgba(255,255,255,0.1)] px-4 py-2.5 font-mono text-sm">
            {data.referralLink}
          </div>
          <button
            onClick={handleCopy}
            className="shrink-0 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-navy transition-colors hover:bg-gray-100"
          >
            {copied ? '✓' : t('referral.copy')}
          </button>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
          <Stat value={data.clicks.toLocaleString(locale)} label={t('referral.clicks')} />
          <Stat value={String(data.successfulReferrals)} label={t('referral.successfulReferrals')} />
          <Stat value={formatCents(data.earningsThisMonthCents)} label={t('referral.earningsThisMonth')} />
          <Stat value={formatCents(data.totalEarningsCents)} label={t('referral.totalEarnings')} />
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-serif text-lg font-semibold text-navy">{t('referral.referralsHeading')}</h2>
        {data.referrals.length === 0 ? (
          <div className="mt-3 rounded-xl border border-gray-200 bg-white px-6 py-10 text-center">
            <p className="text-sm text-ink-soft">{t('referral.noReferralsYet')}</p>
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white">
            {data.referrals.map((r, i) => (
              <li key={i} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  {r.isRenewing && <span className="h-1.5 w-1.5 rounded-full bg-emerald" aria-hidden />}
                  <div>
                    <p className="text-sm text-ink">{r.maskedName}</p>
                    <p className="font-mono text-xs text-ink-soft">
                      {new Date(r.signupDate).toLocaleDateString(locale)} · {r.status}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-sm text-emerald">{formatCents(r.commissionEarnedCents)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-6">
        <p className="text-sm text-ink-soft">{t('referral.withdrawEarnings')}</p>
        <p className="mt-1 font-serif text-4xl font-medium text-navy">{formatCents(data.withdrawableBalanceCents)}</p>
        <button
          onClick={() => setPayoutOpen(true)}
          disabled={data.withdrawableBalanceCents <= 0}
          className="mt-5 rounded-lg bg-emerald px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {t('referral.requestWithdrawal')}
        </button>

        {data.payouts.length > 0 && (
          <ul className="mt-6 divide-y divide-gray-100 border-t border-gray-100">
            {data.payouts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-2.5 text-sm text-ink">
                  <span aria-hidden>{p.method === 'PAYPAL' ? '🅿️' : '🏦'}</span>
                  <span className="font-mono text-xs text-ink-soft">{new Date(p.createdAt).toLocaleDateString(locale)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-ink">{formatCents(p.netAmountCents)}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      p.status === 'COMPLETED' ? 'bg-emerald-soft/20 text-emerald-dark' : 'bg-gray-100 text-ink-soft'
                    }`}
                  >
                    {p.status === 'COMPLETED' ? t('referral.completed') : t('referral.underReview')}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <PayoutModal
        open={payoutOpen}
        onClose={() => setPayoutOpen(false)}
        balanceCents={data.withdrawableBalanceCents}
        onDone={() => {
          setPayoutOpen(false);
          load();
        }}
      />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-serif text-3xl font-medium">{value}</p>
      <p className="mt-1 text-xs text-[#C9D4E3]">{label}</p>
    </div>
  );
}

function PayoutModal({
  open,
  onClose,
  balanceCents,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  balanceCents: number;
  onDone: () => void;
}) {
  const { token } = useAuth();
  const { t } = useLocale();
  const [step, setStep] = useState<'method' | 'details'>('method');
  const [method, setMethod] = useState<PayoutMethod | null>(null);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setStep('method');
      setMethod(null);
      setBankName('');
      setAccountNumber('');
      setAccountHolder('');
      setPaypalEmail('');
    }
  }, [open]);

  // Best-effort estimate for display only — the server computes the
  // authoritative fee from PlatformSettings at request time.
  const estimatedFeeCents = Math.round(balanceCents * 0.029) + 30;
  const estimatedNetCents = Math.max(0, balanceCents - estimatedFeeCents);

  async function handleSubmit() {
    if (!token || !method) return;
    setIsSubmitting(true);
    try {
      if (method === 'BANK_TRANSFER') {
        if (!bankName.trim() || !accountNumber.trim() || !accountHolder.trim()) {
          showError(t('referral.fillBankDetails'));
          setIsSubmitting(false);
          return;
        }
        await requestAffiliatePayout(token, { method, bankName, accountNumber, accountHolder });
      } else {
        if (!paypalEmail.trim()) {
          showError(t('referral.enterPaypalEmail'));
          setIsSubmitting(false);
          return;
        }
        await requestAffiliatePayout(token, { method, paypalEmail });
      }
      showSuccess(t('referral.withdrawalRequested'));
      onDone();
    } catch (err) {
      showError(err instanceof Error ? err.message : t('referral.couldNotRequestWithdrawal'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay-dim fixed inset-0 z-50" />
        <Dialog.Content className="animate-modal-in fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-7 shadow-level-4">
          <Dialog.Title className="font-serif text-xl font-medium text-navy">{t('referral.requestWithdrawal')}</Dialog.Title>

          {step === 'method' ? (
            <>
              <p className="mt-2 text-sm text-ink-soft">
                {t('referral.withdrawingChooseMethod').replace('{amount}', formatCents(balanceCents))}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMethod('BANK_TRANSFER')}
                  className={`rounded-xl border p-5 text-start transition-colors ${
                    method === 'BANK_TRANSFER' ? 'border-emerald bg-emerald-soft/10' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl" aria-hidden>
                    🏦
                  </span>
                  <p className="mt-2 text-sm font-medium text-ink">{t('referral.bankTransfer')}</p>
                  <span className="mt-1 inline-block rounded-full bg-emerald-soft/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-dark">
                    {t('referral.free')}
                  </span>
                </button>
                <button
                  onClick={() => setMethod('PAYPAL')}
                  className={`rounded-xl border p-5 text-start transition-colors ${
                    method === 'PAYPAL' ? 'border-emerald bg-emerald-soft/10' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl" aria-hidden>
                    🅿️
                  </span>
                  <p className="mt-2 text-sm font-medium text-ink">{t('referral.paypal')}</p>
                  <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    {t('referral.transferFeeDeducted')}
                  </span>
                </button>
              </div>
              {method === 'PAYPAL' && (
                <div className="mt-4 rounded-lg bg-surface p-3 font-mono text-xs text-ink-soft">
                  {t('referral.feeBreakdown')
                    .replace('{amount}', formatCents(balanceCents))
                    .replace('{fee}', formatCents(estimatedFeeCents))
                    .replace('{net}', formatCents(estimatedNetCents))}
                </div>
              )}
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={onClose} className="text-sm font-medium text-ink-soft hover:text-ink">
                  {t('referral.cancel')}
                </button>
                <button
                  onClick={() => method && setStep('details')}
                  disabled={!method}
                  className="rounded-lg bg-emerald px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('referral.continue')}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mt-5 space-y-3">
                {method === 'BANK_TRANSFER' ? (
                  <>
                    <input
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder={t('referral.bankName')}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                    <input
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder={t('referral.accountNumber')}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                    <input
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder={t('referral.accountHolderName')}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                  </>
                ) : (
                  <>
                    <input
                      type="email"
                      value={paypalEmail}
                      onChange={(e) => setPaypalEmail(e.target.value)}
                      placeholder={t('referral.paypalEmail')}
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                    />
                    <div className="rounded-lg bg-surface p-3 font-mono text-xs text-ink-soft">
                      {t('referral.feeBreakdown')
                        .replace('{amount}', formatCents(balanceCents))
                        .replace('{fee}', formatCents(estimatedFeeCents))
                        .replace('{net}', formatCents(estimatedNetCents))}
                    </div>
                  </>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button onClick={() => setStep('method')} className="text-sm font-medium text-ink-soft hover:text-ink">
                  {t('referral.back')}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="rounded-lg bg-emerald px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? t('referral.submitting') : t('referral.confirmWithdrawal')}
                </button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
