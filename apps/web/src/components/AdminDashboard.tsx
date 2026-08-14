'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/AdminAuthContext';
import { fetchAdminStats, type AdminStats } from '@/lib/adminApi';

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

export default function AdminDashboard() {
  const { token } = useAdminAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
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

      <div className="mt-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Recent Failures
        </h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200 bg-white">
          {stats.recentFailures.length === 0 ? (
            <p className="px-4 py-6 text-sm text-ink-soft">No recent failures.</p>
          ) : (
            <table className="min-w-full text-left text-sm">
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
    </div>
  );
}
