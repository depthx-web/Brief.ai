'use client';

import { useEffect, useState } from 'react';
import { fetchAdminStats, type AdminStats } from '@/lib/adminApi';

const TOKEN_KEY = 'brief-ai-admin-token';

function sumByStatus(groups: { status: string; _count: number }[], status: string): number {
  return groups.filter((g) => g.status === status).reduce((sum, g) => sum + g._count, 0);
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-2xl font-bold text-navy">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-gray-400">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const [tokenInput, setTokenInput] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(TOKEN_KEY);
    if (stored) {
      setToken(stored);
      loadStats(stored);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadStats(currentToken: string) {
    setIsLoading(true);
    setError(null);
    try {
      setStats(await fetchAdminStats(currentToken));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load stats.');
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sessionStorage.setItem(TOKEN_KEY, tokenInput);
    setToken(tokenInput);
    loadStats(tokenInput);
  }

  function handleLogout() {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setStats(null);
    setTokenInput('');
  }

  if (!token || !stats) {
    return (
      <div className="mx-auto max-w-sm px-6 py-16">
        <h1 className="text-2xl font-bold text-navy">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Internal usage stats — not a customer-facing page.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Admin token</label>
            <input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isLoading || !tokenInput}
            className="w-full rounded-lg bg-navy px-6 py-3 font-medium text-white transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isLoading ? 'Loading…' : 'View Dashboard'}
          </button>
        </form>
      </div>
    );
  }

  const conversionSuccess = sumByStatus(stats.conversions.byStatus, 'SUCCESS');
  const conversionFailed = sumByStatus(stats.conversions.byStatus, 'FAILED');
  const aiSuccess = stats.aiOperations
    .filter((o) => o.status === 'SUCCESS')
    .reduce((sum, o) => sum + o._count, 0);
  const aiFailed = stats.aiOperations
    .filter((o) => o.status === 'FAILED')
    .reduce((sum, o) => sum + o._count, 0);

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-navy">Admin Dashboard</h1>
        <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-red-600">
          Log out
        </button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Total Users" value={stats.users.total} />
        <StatTile label="Library Documents" value={stats.libraryDocuments.total} />
        <StatTile label="Conversions OK" value={conversionSuccess} />
        <StatTile label="Conversions Failed" value={conversionFailed} />
        <StatTile label="AI Calls OK" value={aiSuccess} />
        <StatTile label="AI Calls Failed" value={aiFailed} />
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          Users by Profession
        </h2>
        <div className="mt-3 flex gap-4 text-sm">
          {stats.users.bySegment.length === 0 ? (
            <p className="text-gray-400">No signups yet.</p>
          ) : (
            stats.users.bySegment.map((s) => (
              <span key={s.segment ?? 'none'} className="rounded-md bg-gray-100 px-3 py-1">
                {s.segment ?? 'Unspecified'}: {s._count}
              </span>
            ))
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          Recent Failures
        </h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200 bg-white">
          {stats.recentFailures.length === 0 ? (
            <p className="px-4 py-6 text-sm text-gray-400">No recent failures.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase text-gray-400">
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
                    <td className="px-3 py-2 capitalize text-gray-600">{f.type}</td>
                    <td className="px-3 py-2 text-gray-600">{f.detail}</td>
                    <td className="max-w-xs truncate px-3 py-2 text-red-600">{f.errorMessage}</td>
                    <td className="px-3 py-2 text-gray-400">
                      {new Date(f.createdAt).toLocaleString()}
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
