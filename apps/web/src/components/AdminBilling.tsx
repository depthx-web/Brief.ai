'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/AdminAuthContext';
import {
  fetchAdminTransactions,
  fetchAdminFailedPayments,
  retryAdminFailedPayment,
  fetchAdminPaymentProvider,
  fetchAdminSettings,
  updateAdminSettings,
  type AdminPaymentTransaction,
  type AdminFailedPaymentUser,
  type AdminPaymentProvider,
} from '@/lib/adminApi';
import { showError, showSuccess } from '@/lib/toast';

function formatDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const STATUS_BADGE: Record<string, string> = {
  SUCCEEDED: 'bg-emerald-soft/20 text-emerald-dark',
  FAILED: 'bg-red-50 text-redline',
  REFUNDED: 'bg-gray-100 text-ink-soft',
};

const TYPE_LABEL: Record<string, string> = {
  SUBSCRIPTION_PAYMENT: 'Subscription',
  CREDIT_PURCHASE: 'Credit purchase',
  REFUND: 'Refund',
};

export default function AdminBilling() {
  const { token } = useAdminAuth();
  const [transactions, setTransactions] = useState<AdminPaymentTransaction[]>([]);
  const [failedPayments, setFailedPayments] = useState<AdminFailedPaymentUser[]>([]);
  const [provider, setProvider] = useState<AdminPaymentProvider | null>(null);
  const [autoRetryEnabled, setAutoRetryEnabled] = useState(true);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [intervalDays, setIntervalDays] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  function load() {
    if (!token) return;
    setIsLoading(true);
    Promise.all([
      fetchAdminTransactions(token),
      fetchAdminFailedPayments(token),
      fetchAdminPaymentProvider(token),
      fetchAdminSettings(token),
    ])
      .then(([tx, failed, prov, settings]) => {
        setTransactions(tx.transactions);
        setFailedPayments(failed.users);
        setProvider(prov);
        setAutoRetryEnabled(settings.dunningAutoRetryEnabled);
        setMaxAttempts(settings.dunningMaxAttempts);
        setIntervalDays(settings.dunningIntervalDays);
      })
      .catch((err) => showError(err instanceof Error ? err.message : 'Could not load billing data.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, [token]);

  async function toggleAutoRetry() {
    if (!token) return;
    const next = !autoRetryEnabled;
    setAutoRetryEnabled(next);
    try {
      await updateAdminSettings(token, { dunningAutoRetryEnabled: next });
    } catch (err) {
      setAutoRetryEnabled(!next);
      showError(err instanceof Error ? err.message : 'Could not update this setting.');
    }
  }

  async function saveDunningNumbers() {
    if (!token) return;
    try {
      await updateAdminSettings(token, { dunningMaxAttempts: maxAttempts, dunningIntervalDays: intervalDays });
      showSuccess('Saved successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not save these settings.');
    }
  }

  async function togglePaymentsEnabled() {
    if (!token || !provider) return;
    const next = !provider.enabled;
    setProvider({ ...provider, enabled: next });
    try {
      await updateAdminSettings(token, { paymentsEnabled: next });
    } catch (err) {
      setProvider({ ...provider, enabled: !next });
      showError(err instanceof Error ? err.message : 'Could not update this setting.');
    }
  }

  async function handleRetry(userId: string) {
    if (!token) return;
    setRetryingId(userId);
    try {
      const { recovered } = await retryAdminFailedPayment(token, userId);
      showSuccess(recovered ? 'Payment recovered' : 'Checked in with Lemon Squeezy — still failing');
      load();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not retry this payment.');
    } finally {
      setRetryingId(null);
    }
  }

  if (isLoading) return <div className="px-8 py-10 text-sm text-ink-soft">Loading…</div>;

  return (
    <div className="mx-auto max-w-5xl px-8 py-10 pb-24">
      <h1 className="font-serif text-2xl font-medium text-navy">Billing</h1>

      {/* Payment methods */}
      <div className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Payment methods</h2>
        {provider && (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
            <div>
              <p className="font-medium text-ink">{provider.name}</p>
              <p className="mt-1 font-mono text-xs text-ink-soft">
                {provider.configured ? provider.maskedKey : 'Not configured'}
              </p>
              <span
                className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  provider.configured ? 'bg-emerald-soft/20 text-emerald-dark' : 'bg-gray-100 text-ink-soft'
                }`}
              >
                {provider.configured ? 'Configured' : 'Not configured'}
              </span>
            </div>
            <button
              onClick={togglePaymentsEnabled}
              className={`h-5 w-9 rounded-full transition-colors ${provider.enabled ? 'bg-emerald' : 'bg-gray-300'}`}
            >
              <span
                className={`block h-4 w-4 translate-y-0.5 rounded-full bg-white transition-transform ${
                  provider.enabled ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        )}
      </div>

      {/* Failed payments (dunning) */}
      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Failed payments</h2>
          <div className="flex items-center gap-4 text-sm text-ink">
            <label className="flex items-center gap-2">
              Automatic retry
              <button
                onClick={toggleAutoRetry}
                className={`h-5 w-9 rounded-full transition-colors ${autoRetryEnabled ? 'bg-emerald' : 'bg-gray-300'}`}
              >
                <span
                  className={`block h-4 w-4 translate-y-0.5 rounded-full bg-white transition-transform ${
                    autoRetryEnabled ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </label>
            <label className="flex items-center gap-1.5">
              Attempts
              <input
                type="number"
                min={1}
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Math.max(1, parseInt(e.target.value, 10) || 1))}
                onBlur={saveDunningNumbers}
                className="w-14 rounded-md border border-gray-300 px-2 py-1 font-mono text-sm"
              />
            </label>
            <label className="flex items-center gap-1.5">
              Every
              <input
                type="number"
                min={1}
                value={intervalDays}
                onChange={(e) => setIntervalDays(Math.max(1, parseInt(e.target.value, 10) || 1))}
                onBlur={saveDunningNumbers}
                className="w-14 rounded-md border border-gray-300 px-2 py-1 font-mono text-sm"
              />
              days
            </label>
          </div>
        </div>

        <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white">
          {failedPayments.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-ink-soft">No failed payments right now.</p>
          ) : (
            <table className="min-w-full text-start text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase text-ink-soft">
                <tr>
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Plan</th>
                  <th className="px-4 py-2">Attempts</th>
                  <th className="px-4 py-2">Last failure</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {failedPayments.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-2.5">
                      <p className="text-ink">{u.name ?? u.email}</p>
                      <p className="text-xs text-ink-soft">{u.email}</p>
                    </td>
                    <td className="px-4 py-2.5 text-ink-soft">
                      {u.plan}
                      {u.billingCycle ? ` · ${u.billingCycle}` : ''}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-ink">{u.dunningAttemptCount}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-ink-soft">
                      {u.lastPaymentFailedAt ? new Date(u.lastPaymentFailedAt).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-end">
                      <button
                        onClick={() => handleRetry(u.id)}
                        disabled={retryingId === u.id}
                        className="text-xs font-medium text-emerald hover:underline disabled:opacity-50"
                      >
                        {retryingId === u.id ? 'Retrying…' : 'Retry now'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Transactions */}
      <div className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Transactions</h2>
        <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white">
          {transactions.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-ink-soft">No transactions yet.</p>
          ) : (
            <table className="min-w-full text-start text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase text-ink-soft">
                <tr>
                  <th className="px-4 py-2">User</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Provider</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-4 py-2.5">
                      <p className="text-ink">{tx.user.name ?? tx.user.email}</p>
                      <p className="text-xs text-ink-soft">{tx.user.email}</p>
                    </td>
                    <td className="px-4 py-2.5 text-ink-soft">{TYPE_LABEL[tx.type]}</td>
                    <td className="px-4 py-2.5 font-mono text-ink">{formatDollars(tx.amountCents)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${STATUS_BADGE[tx.status]}`}>
                        {tx.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-ink-soft">{tx.provider}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-ink-soft">
                      {new Date(tx.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
