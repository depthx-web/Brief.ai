'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/AdminAuthContext';
import {
  fetchAdminAffiliates,
  fetchAdminAffiliateDetail,
  blockAdminAffiliate,
  deleteAdminAffiliateData,
  markAdminAffiliatePaid,
  fetchAdminPayoutRequests,
  confirmAdminPayout,
  fetchAdminAffiliateLeaderboard,
  fetchAdminSettings,
  updateAdminSettings,
  type AdminAffiliateSummary,
  type AdminAffiliateDetail,
  type AdminPayoutRequestRow,
  type AdminAffiliateLeaderboardRow,
} from '@/lib/adminApi';
import { showError, showSuccess } from '@/lib/toast';

function formatDollars(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function AffiliateDrawer({ userId, onClose, onChanged }: { userId: string; onClose: () => void; onChanged: () => void }) {
  const { token } = useAdminAuth();
  const [detail, setDetail] = useState<AdminAffiliateDetail | null>(null);
  const [isActing, setIsActing] = useState(false);
  const [confirmingBlock, setConfirmingBlock] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [markingPaid, setMarkingPaid] = useState(false);
  const [reference, setReference] = useState('');

  function load() {
    if (!token) return;
    fetchAdminAffiliateDetail(token, userId).then(setDetail).catch(() => {});
  }

  useEffect(load, [token, userId]);

  async function handleBlock() {
    if (!token) return;
    setIsActing(true);
    try {
      await blockAdminAffiliate(token, userId);
      setConfirmingBlock(false);
      load();
      onChanged();
      showSuccess('Affiliate blocked from the program');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not block this affiliate.');
    } finally {
      setIsActing(false);
    }
  }

  async function handleDelete() {
    if (!token) return;
    setIsActing(true);
    try {
      await deleteAdminAffiliateData(token, userId);
      onChanged();
      onClose();
      showSuccess('Affiliate data deleted');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not delete this affiliate data.');
    } finally {
      setIsActing(false);
    }
  }

  async function handleMarkPaid() {
    if (!token || !reference.trim()) return;
    setIsActing(true);
    try {
      await markAdminAffiliatePaid(token, userId, reference);
      setMarkingPaid(false);
      setReference('');
      load();
      showSuccess('Payout marked as paid');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not mark this payout as paid.');
    } finally {
      setIsActing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[rgba(15,35,64,0.4)]" onClick={onClose}>
      <div className="h-full w-[420px] overflow-y-auto bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="text-sm text-ink-soft hover:text-ink">
          ← Close
        </button>

        {!detail ? (
          <p className="mt-8 text-sm text-ink-soft">Loading…</p>
        ) : (
          <>
            <div className="mt-4 flex items-center gap-2">
              <h2 className="font-serif text-xl font-semibold text-navy">Affiliate</h2>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                  detail.status === 'ACTIVE' ? 'bg-emerald-soft/20 text-emerald-dark' : 'bg-red-50 text-redline'
                }`}
              >
                {detail.status === 'ACTIVE' ? 'Active' : 'Blocked'}
              </span>
            </div>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-soft">Clicks</span>
                <span className="font-mono text-ink">{detail.clicks}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">Referrals</span>
                <span className="font-mono text-ink">{detail.successfulReferrals}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">Total commissions</span>
                <span className="font-mono text-ink">{formatDollars(detail.totalEarningsCents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">Withdrawable balance</span>
                <span className="font-mono text-ink">{formatDollars(detail.withdrawableBalanceCents)}</span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {confirmingBlock ? (
                <div className="rounded-lg border border-redline/40 p-3">
                  <p className="text-xs text-ink-soft">
                    This instantly disables the referral link — future clicks won&apos;t record a referral. Commissions
                    already earned remain payable.
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={handleBlock}
                      disabled={isActing}
                      className="rounded-md bg-redline px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                    >
                      Confirm block
                    </button>
                    <button onClick={() => setConfirmingBlock(false)} className="rounded-md px-3 py-1.5 text-xs text-ink-soft hover:text-ink">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                detail.status === 'ACTIVE' && (
                  <button
                    onClick={() => setConfirmingBlock(true)}
                    className="w-full rounded-lg border border-redline px-4 py-2.5 text-sm font-medium text-redline transition-colors hover:bg-red-50"
                  >
                    Block from program
                  </button>
                )
              )}

              {markingPaid ? (
                <div className="rounded-lg border border-navy-light/40 p-3">
                  <p className="text-xs text-ink-soft">Marks the latest pending payout request as completed.</p>
                  <input
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Transaction reference"
                    className="mt-2 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={handleMarkPaid}
                      disabled={isActing || !reference.trim()}
                      className="rounded-md bg-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Confirm
                    </button>
                    <button onClick={() => setMarkingPaid(false)} className="rounded-md px-3 py-1.5 text-xs text-ink-soft hover:text-ink">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setMarkingPaid(true)}
                  className="w-full rounded-lg border border-navy-light px-4 py-2.5 text-sm font-medium text-navy-light transition-colors hover:bg-navy-light/5"
                >
                  Mark as paid manually
                </button>
              )}

              {confirmingDelete ? (
                <div className="rounded-lg border border-redline p-3">
                  <p className="text-xs text-redline">
                    This permanently deletes this affiliate&apos;s click and referral history. Cannot be undone.
                  </p>
                  <label className="mt-2 block text-xs font-medium text-ink">
                    Type <span className="font-mono text-redline">delete</span> to confirm
                  </label>
                  <input
                    value={deleteText}
                    onChange={(e) => setDeleteText(e.target.value)}
                    className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={handleDelete}
                      disabled={deleteText !== 'delete' || isActing}
                      className="rounded-md bg-redline px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
                    >
                      Confirm permanent deletion
                    </button>
                    <button
                      onClick={() => {
                        setConfirmingDelete(false);
                        setDeleteText('');
                      }}
                      className="rounded-md px-3 py-1.5 text-xs text-ink-soft hover:text-ink"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingDelete(true)}
                  className="w-full rounded-lg bg-redline px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700"
                >
                  Delete affiliate data
                </button>
              )}
            </div>

            <div className="mt-8">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Payout requests</h3>
              {detail.payouts.length === 0 ? (
                <p className="mt-2 text-sm text-ink-soft">No requests yet.</p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {detail.payouts.map((p) => (
                    <li key={p.id} className="flex justify-between text-sm">
                      <span className="text-ink">{p.method === 'PAYPAL' ? 'PayPal' : 'Bank transfer'}</span>
                      <span className="font-mono text-xs text-ink-soft">
                        {formatDollars(p.netAmountCents)} · {p.status === 'COMPLETED' ? 'completed' : 'under review'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AdminAffiliate() {
  const { token } = useAdminAuth();
  const [affiliates, setAffiliates] = useState<AdminAffiliateSummary[]>([]);
  const [payouts, setPayouts] = useState<AdminPayoutRequestRow[]>([]);
  const [leaderboard, setLeaderboard] = useState<AdminAffiliateLeaderboardRow[]>([]);
  const [signupPercent, setSignupPercent] = useState(5);
  const [renewalPercent, setRenewalPercent] = useState(3);
  const [paypalFeePercent, setPaypalFeePercent] = useState(2.9);
  const [paypalFeeFixedCents, setPaypalFeeFixedCents] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [confirmingPayoutId, setConfirmingPayoutId] = useState<string | null>(null);
  const [payoutReference, setPayoutReference] = useState('');

  function load() {
    if (!token) return;
    setIsLoading(true);
    Promise.all([
      fetchAdminAffiliates(token),
      fetchAdminPayoutRequests(token),
      fetchAdminAffiliateLeaderboard(token),
      fetchAdminSettings(token),
    ])
      .then(([a, p, l, s]) => {
        setAffiliates(a);
        setPayouts(p);
        setLeaderboard(l);
        setSignupPercent(s.commissionSignupPercent);
        setRenewalPercent(s.commissionRenewalPercent);
        setPaypalFeePercent(s.paypalFeePercent);
        setPaypalFeeFixedCents(s.paypalFeeFixedCents);
      })
      .catch((err) => showError(err instanceof Error ? err.message : 'Could not load referral program data.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, [token]);

  async function saveRates() {
    if (!token) return;
    try {
      await updateAdminSettings(token, {
        commissionSignupPercent: signupPercent,
        commissionRenewalPercent: renewalPercent,
        paypalFeePercent,
        paypalFeeFixedCents,
      });
      showSuccess('Saved successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not save these settings.');
    }
  }

  async function handleConfirmPayout(id: string) {
    if (!token || !payoutReference.trim()) return;
    try {
      await confirmAdminPayout(token, id, payoutReference);
      setConfirmingPayoutId(null);
      setPayoutReference('');
      load();
      showSuccess('Payout confirmed');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not confirm this payout.');
    }
  }

  if (isLoading) return <div className="px-8 py-10 text-sm text-ink-soft">Loading…</div>;

  return (
    <div className="mx-auto max-w-5xl px-8 py-10 pb-24">
      <h1 className="font-serif text-2xl font-medium text-navy">Referral Program</h1>

      {/* Commission rate settings */}
      <div className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Commission rates</h2>
        <div className="mt-3 flex flex-wrap items-end gap-4 rounded-lg border border-gray-200 bg-white p-4">
          <label className="flex flex-col gap-1 text-sm text-ink">
            New subscription
            <input
              type="number"
              min={0}
              max={100}
              value={signupPercent}
              onChange={(e) => setSignupPercent(Math.max(0, parseInt(e.target.value, 10) || 0))}
              onBlur={saveRates}
              className="w-24 rounded-md border border-gray-300 px-2 py-1.5 font-mono text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink">
            Renewal
            <input
              type="number"
              min={0}
              max={100}
              value={renewalPercent}
              onChange={(e) => setRenewalPercent(Math.max(0, parseInt(e.target.value, 10) || 0))}
              onBlur={saveRates}
              className="w-24 rounded-md border border-gray-300 px-2 py-1.5 font-mono text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink">
            PayPal fee %
            <input
              type="number"
              min={0}
              step="0.1"
              value={paypalFeePercent}
              onChange={(e) => setPaypalFeePercent(Math.max(0, parseFloat(e.target.value) || 0))}
              onBlur={saveRates}
              className="w-24 rounded-md border border-gray-300 px-2 py-1.5 font-mono text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-ink">
            PayPal fixed fee (¢)
            <input
              type="number"
              min={0}
              value={paypalFeeFixedCents}
              onChange={(e) => setPaypalFeeFixedCents(Math.max(0, parseInt(e.target.value, 10) || 0))}
              onBlur={saveRates}
              className="w-24 rounded-md border border-gray-300 px-2 py-1.5 font-mono text-sm"
            />
          </label>
        </div>
      </div>

      {/* Affiliate management */}
      <div className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Affiliates</h2>
        <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white">
          {affiliates.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-ink-soft">No affiliates yet.</p>
          ) : (
            <table className="min-w-full text-start text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase text-ink-soft">
                <tr>
                  <th className="px-4 py-2">Affiliate</th>
                  <th className="px-4 py-2">Clicks</th>
                  <th className="px-4 py-2">Referrals</th>
                  <th className="px-4 py-2">Total commissions</th>
                  <th className="px-4 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {affiliates.map((a) => (
                  <tr key={a.userId} onClick={() => setSelectedUserId(a.userId)} className="cursor-pointer hover:bg-surface">
                    <td className="px-4 py-2.5">
                      <p className="text-ink">{a.name ?? a.email}</p>
                      <p className="text-xs text-ink-soft">{a.email}</p>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-ink">{a.clicks}</td>
                    <td className="px-4 py-2.5 font-mono text-ink">{a.referrals}</td>
                    <td className="px-4 py-2.5 font-mono text-ink">{formatDollars(a.totalCommissionsCents)}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          a.status === 'ACTIVE' ? 'bg-emerald-soft/20 text-emerald-dark' : 'bg-red-50 text-redline'
                        }`}
                      >
                        {a.status === 'ACTIVE' ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Payout requests */}
      <div className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Payout requests</h2>
        <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white">
          {payouts.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-ink-soft">No payout requests yet.</p>
          ) : (
            <table className="min-w-full text-start text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase text-ink-soft">
                <tr>
                  <th className="px-4 py-2">Affiliate</th>
                  <th className="px-4 py-2">Method</th>
                  <th className="px-4 py-2">Net after fees</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payouts.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2.5">
                      <p className="text-ink">{p.user.name ?? p.user.email}</p>
                      <p className="text-xs text-ink-soft">{p.user.email}</p>
                    </td>
                    <td className="px-4 py-2.5 text-ink-soft">{p.method === 'PAYPAL' ? '🅿️ PayPal' : '🏦 Bank transfer'}</td>
                    <td className="px-4 py-2.5 font-mono text-ink">{formatDollars(p.netAmountCents)}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          p.status === 'COMPLETED' ? 'bg-emerald-soft/20 text-emerald-dark' : 'bg-gray-100 text-ink-soft'
                        }`}
                      >
                        {p.status === 'COMPLETED' ? 'Completed' : 'Under review'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-end">
                      {p.status === 'UNDER_REVIEW' &&
                        (confirmingPayoutId === p.id ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <input
                              value={payoutReference}
                              onChange={(e) => setPayoutReference(e.target.value)}
                              placeholder="Reference"
                              className="w-28 rounded-md border border-gray-300 px-2 py-1 text-xs"
                            />
                            <button
                              onClick={() => handleConfirmPayout(p.id)}
                              disabled={!payoutReference.trim()}
                              className="rounded-md border border-navy-light px-2 py-1 text-xs font-medium text-navy-light hover:bg-navy-light/5 disabled:opacity-50"
                            >
                              Confirm
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmingPayoutId(p.id)}
                            className="rounded-md border border-navy-light px-2 py-1 text-xs font-medium text-navy-light hover:bg-navy-light/5"
                          >
                            Confirm manual payment
                          </button>
                        ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Top affiliates</h2>
        <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white">
          {leaderboard.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-ink-soft">No commissions generated yet.</p>
          ) : (
            <table className="min-w-full text-start text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase text-ink-soft">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Affiliate</th>
                  <th className="px-4 py-2">Total commissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leaderboard.map((row, i) => (
                  <tr key={row.userId}>
                    <td className="px-4 py-2.5 font-mono text-ink-soft">{i + 1}</td>
                    <td className="px-4 py-2.5 text-ink">{row.name ?? row.email}</td>
                    <td className="px-4 py-2.5 font-mono text-ink">{formatDollars(row.totalCommissionsCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {selectedUserId && (
        <AffiliateDrawer userId={selectedUserId} onClose={() => setSelectedUserId(null)} onChanged={load} />
      )}
    </div>
  );
}
