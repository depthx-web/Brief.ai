'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/AdminAuthContext';
import {
  fetchAdminStats,
  fetchAdminCreditTransactions,
  fetchAdminSettings,
  updateAdminSettings,
  fetchAdminHomepageStats,
  type AdminStats,
  type AdminCreditTransaction,
  type AdminHomepageStats,
} from '@/lib/adminApi';
import { showError } from '@/lib/toast';

const REASON_LABEL: Record<AdminCreditTransaction['reason'], string> = {
  PURCHASE: 'Purchase',
  AI_USAGE: 'AI usage',
  MANUAL_ADMIN_ADJUSTMENT: 'Manual adjustment',
};

function CreditTransactionsTab() {
  const { token } = useAdminAuth();
  const [transactions, setTransactions] = useState<AdminCreditTransaction[] | null>(null);

  useEffect(() => {
    if (!token) return;
    fetchAdminCreditTransactions(token).then(setTransactions);
  }, [token]);

  if (!transactions) return <p className="mt-6 text-sm text-ink-soft">Loading…</p>;

  return (
    <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
      {transactions.length === 0 ? (
        <p className="px-4 py-6 text-sm text-ink-soft">No credit transactions yet.</p>
      ) : (
        <table className="min-w-full text-start text-sm">
          <thead className="border-b border-gray-200 text-xs uppercase text-ink-soft">
            <tr>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Amount</th>
              <th className="px-3 py-2">Note</th>
              <th className="px-3 py-2">When</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {transactions.map((t) => (
              <tr key={t.id}>
                <td className="px-3 py-2 text-ink">{t.user.name || t.user.email}</td>
                <td className="px-3 py-2 text-ink-soft">{REASON_LABEL[t.reason]}</td>
                <td className={`px-3 py-2 font-mono ${t.delta > 0 ? 'text-emerald' : 'text-ink'}`}>
                  {t.delta > 0 ? `+${t.delta}` : t.delta}
                </td>
                <td className="px-3 py-2 text-ink-soft">{t.adminNote ?? '—'}</td>
                <td className="px-3 py-2 text-ink-soft">{new Date(t.createdAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function sumByStatus(groups: { status: string; _count: number }[], status: string): number {
  return groups.filter((g) => g.status === status).reduce((sum, g) => sum + g._count, 0);
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-2xl font-bold text-navy">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-ink-soft">{label}</p>
    </div>
  );
}

function formatRealMetric(m: AdminHomepageStats['autoDeletionCompliance'], unit: '%' | 's'): string {
  if (m.isFallback || m.value === null) return 'Below 50-sample threshold — showing honest wording instead';
  return unit === '%' ? `${Math.round(m.value)}%` : `${m.value}s avg`;
}

function HomepageStatsCard() {
  const { token } = useAdminAuth();
  const [demoMode, setDemoMode] = useState<boolean | null>(null);
  const [real, setReal] = useState<AdminHomepageStats | null>(null);

  useEffect(() => {
    if (!token) return;
    Promise.all([fetchAdminSettings(token), fetchAdminHomepageStats(token)]).then(([settings, stats]) => {
      setDemoMode(settings.homepageStatsDemoMode);
      setReal(stats);
    });
  }, [token]);

  async function toggleDemoMode() {
    if (!token || demoMode === null) return;
    const next = !demoMode;
    setDemoMode(next);
    try {
      await updateAdminSettings(token, { homepageStatsDemoMode: next });
    } catch (err) {
      setDemoMode(!next);
      showError(err instanceof Error ? err.message : 'Could not update this setting.');
    }
  }

  if (demoMode === null) return null;

  return (
    <div className="mt-8 rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Homepage Trust Stats</h2>
          <p className="mt-1 text-sm text-ink">
            {demoMode ? 'Showing illustrative demo numbers to visitors.' : 'Showing real computed numbers to visitors.'}
          </p>
        </div>
        <button
          onClick={toggleDemoMode}
          className={`rounded-md px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
            demoMode ? 'bg-emerald text-white hover:bg-emerald-dark' : 'border border-gray-300 text-ink-soft hover:bg-gray-50'
          }`}
        >
          {demoMode ? 'Switch to live data' : 'Switch to demo data'}
        </button>
      </div>
      {real && (
        <div className="mt-4 grid grid-cols-1 gap-3 border-t border-gray-100 pt-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-soft">Auto-deletion compliance</p>
            <p className="mt-0.5 text-ink">{formatRealMetric(real.autoDeletionCompliance, '%')}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-soft">Avg processing time</p>
            <p className="mt-0.5 text-ink">{formatRealMetric(real.avgProcessingSeconds, 's')}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-soft">Client-side share</p>
            <p className="mt-0.5 text-ink">{formatRealMetric(real.clientSideShare, '%')}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'overview' | 'credits'>('overview');

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    fetchAdminStats(token)
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load stats.'))
      .finally(() => setIsLoading(false));
  }, [token]);

  if (isLoading) return <div className="px-8 py-10 text-sm text-ink-soft">Loading…</div>;
  if (error) return <div className="px-8 py-10 text-sm text-redline">{error}</div>;
  if (!stats) return null;

  const conversionSuccess = sumByStatus(stats.conversions.byStatus, 'SUCCESS');
  const conversionFailed = sumByStatus(stats.conversions.byStatus, 'FAILED');
  const aiSuccess = stats.aiOperations
    .filter((o) => o.status === 'SUCCESS')
    .reduce((sum, o) => sum + o._count, 0);
  const aiFailed = stats.aiOperations
    .filter((o) => o.status === 'FAILED')
    .reduce((sum, o) => sum + o._count, 0);

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <h1 className="font-serif text-2xl font-medium text-navy">Analytics</h1>

      <div className="mt-6 flex gap-1">
        {(['overview', 'credits'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-t-lg px-4 py-2 text-xs font-medium uppercase tracking-wide transition-colors ${
              tab === t ? 'bg-white text-navy shadow-[0_-2px_8px_rgba(0,0,0,0.06)]' : 'bg-gray-100 text-ink-soft'
            }`}
          >
            {t === 'overview' ? 'Overview' : 'Credit Transactions'}
          </button>
        ))}
      </div>

      {tab === 'credits' ? (
        <CreditTransactionsTab />
      ) : (
        <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Total Users" value={stats.users.total} />
        <StatTile label="Library Documents" value={stats.libraryDocuments.total} />
        <StatTile label="Conversions OK" value={conversionSuccess} />
        <StatTile label="Conversions Failed" value={conversionFailed} />
        <StatTile label="AI Calls OK" value={aiSuccess} />
        <StatTile label="AI Calls Failed" value={aiFailed} />
      </div>

      <div className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Users by Profession
        </h2>
        <div className="mt-3 flex gap-4 text-sm">
          {stats.users.bySegment.length === 0 ? (
            <p className="text-ink-soft">No signups yet.</p>
          ) : (
            stats.users.bySegment.map((s) => (
              <span key={s.segment ?? 'none'} className="rounded-md bg-white px-3 py-1 text-ink">
                {s.segment ?? 'Unspecified'}: {s._count}
              </span>
            ))
          )}
        </div>
      </div>

      <HomepageStatsCard />

      <div className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Recent Failures
        </h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200 bg-white">
          {stats.recentFailures.length === 0 ? (
            <p className="px-4 py-6 text-sm text-ink-soft">No recent failures.</p>
          ) : (
            <table className="min-w-full text-start text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase text-ink-soft">
                <tr>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Detail</th>
                  <th className="px-3 py-2">Error</th>
                  <th className="px-3 py-2">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentFailures.map((f) => (
                  <tr key={`${f.type}-${f.id}`}>
                    <td className="px-3 py-2 capitalize text-ink">{f.type}</td>
                    <td className="px-3 py-2 text-ink">{f.detail}</td>
                    <td className="max-w-xs truncate px-3 py-2 text-redline">{f.errorMessage}</td>
                    <td className="px-3 py-2 text-ink-soft">
                      {new Date(f.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
}
