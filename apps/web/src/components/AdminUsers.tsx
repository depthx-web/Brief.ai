'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAdminAuth } from '@/lib/AdminAuthContext';
import {
  fetchAdminUsers,
  fetchAdminUser,
  banAdminUser,
  reactivateAdminUser,
  resetAdminUserPassword,
  type AdminUserSummary,
  type AdminUserDetail,
  type AdminSegment,
  type AdminPlan,
  type AdminUserStatus,
} from '@/lib/adminApi';

const SEGMENT_ICON: Record<AdminSegment, string> = {
  LAWYER: '⚖️',
  ACCOUNTANT: '🧮',
  RESEARCHER: '📖',
};

function StatusBadge({ status }: { status: AdminUserStatus }) {
  if (status === 'BANNED') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-redline">
        <span className="h-1.5 w-1.5 rounded-full bg-redline" />
        Banned
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-emerald">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald" />
      Active
    </span>
  );
}

function UserDrawer({ userId, onClose, onChanged }: { userId: string; onClose: () => void; onChanged: () => void }) {
  const { token } = useAdminAuth();
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    fetchAdminUser(token, userId)
      .then(setDetail)
      .finally(() => setIsLoading(false));
  }, [token, userId]);

  async function handleBan() {
    if (!token) return;
    setIsActing(true);
    try {
      await banAdminUser(token, userId);
      onChanged();
      setDetail(await fetchAdminUser(token, userId));
    } finally {
      setIsActing(false);
    }
  }

  async function handleReactivate() {
    if (!token) return;
    setIsActing(true);
    try {
      await reactivateAdminUser(token, userId);
      onChanged();
      setDetail(await fetchAdminUser(token, userId));
    } finally {
      setIsActing(false);
    }
  }

  async function handleResetPassword() {
    if (!token) return;
    setIsActing(true);
    try {
      await resetAdminUserPassword(token, userId);
      setMessage('A temporary password has been emailed to this user.');
      setConfirmingReset(false);
    } finally {
      setIsActing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[rgba(15,35,64,0.4)]" onClick={onClose}>
      <div
        className="h-full w-[420px] overflow-y-auto bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="text-sm text-ink-soft hover:text-ink">
          ← Close
        </button>

        {isLoading || !detail ? (
          <p className="mt-8 text-sm text-ink-soft">Loading…</p>
        ) : (
          <>
            <h2 className="mt-4 font-serif text-xl font-semibold text-navy">
              {detail.user.name || detail.user.email}
            </h2>
            <p className="text-sm text-ink-soft">{detail.user.email}</p>

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-soft">Segment</span>
                <span className="text-ink">
                  {detail.user.segment ? `${SEGMENT_ICON[detail.user.segment]} ${detail.user.segment}` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">Plan</span>
                <span className="text-ink">
                  {detail.user.plan}
                  {detail.user.billingCycle ? ` · ${detail.user.billingCycle}` : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">Status</span>
                <StatusBadge status={detail.user.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">Signed up</span>
                <span className="text-ink">{new Date(detail.user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {message && <p className="mt-4 text-sm text-emerald">{message}</p>}

            <div className="mt-6 space-y-2">
              {detail.user.status === 'BANNED' ? (
                <button
                  onClick={handleReactivate}
                  disabled={isActing}
                  className="w-full rounded-lg bg-emerald px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reactivate account
                </button>
              ) : (
                <button
                  onClick={handleBan}
                  disabled={isActing}
                  className="w-full rounded-lg border border-redline px-4 py-2.5 text-sm font-medium text-redline transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Ban account
                </button>
              )}

              {confirmingReset ? (
                <div className="rounded-lg border border-gray-200 p-3">
                  <p className="text-xs text-ink-soft">
                    This generates a new temporary password and emails it to the user. Continue?
                  </p>
                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={handleResetPassword}
                      disabled={isActing}
                      className="rounded-md bg-navy px-3 py-1.5 text-xs font-medium text-white hover:bg-navy-light"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmingReset(false)}
                      className="rounded-md px-3 py-1.5 text-xs text-ink-soft hover:text-ink"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingReset(true)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-gray-300"
                >
                  Set new temporary password
                </button>
              )}
            </div>

            <div className="mt-8">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Recent uploads
              </h3>
              {detail.recentUploads.length === 0 ? (
                <p className="mt-2 text-sm text-ink-soft">No uploads yet.</p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {detail.recentUploads.map((u) => (
                    <li key={u.id} className="flex justify-between text-sm">
                      <span className="truncate font-mono text-xs text-ink">{u.filename}</span>
                      <span className="ml-2 shrink-0 text-xs text-ink-soft">
                        {new Date(u.createdAt).toLocaleDateString()}
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

export default function AdminUsers() {
  const { token } = useAdminAuth();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [segment, setSegment] = useState<AdminSegment | ''>('');
  const [plan, setPlan] = useState<AdminPlan | ''>('');
  const [status, setStatus] = useState<AdminUserStatus | ''>('');
  const [users, setUsers] = useState<AdminUserSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  function load() {
    if (!token) return;
    setIsLoading(true);
    fetchAdminUsers(token, {
      search: search || undefined,
      segment: segment || undefined,
      plan: plan || undefined,
      status: status || undefined,
    })
      .then((res) => {
        setUsers(res.users);
        setTotal(res.total);
      })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, search, segment, plan, status]);

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <h1 className="font-serif text-2xl font-medium text-navy">Users</h1>
      <p className="mt-1 text-sm text-ink-soft">{total} total</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email…"
          className="w-64 rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        />
        <select
          value={segment}
          onChange={(e) => setSegment(e.target.value as AdminSegment | '')}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">All segments</option>
          <option value="LAWYER">Lawyer</option>
          <option value="ACCOUNTANT">Accountant</option>
          <option value="RESEARCHER">Researcher</option>
        </select>
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value as AdminPlan | '')}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">All plans</option>
          <option value="FREE">Free</option>
          <option value="PAID">Paid</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as AdminUserStatus | '')}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="BANNED">Banned</option>
        </select>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <p className="px-4 py-6 text-sm text-ink-soft">Loading…</p>
        ) : users.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink-soft">No users match these filters.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase text-ink-soft">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Segment</th>
                <th className="px-4 py-2">Plan</th>
                <th className="px-4 py-2">Signed up</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => setSelectedUserId(u.id)}
                  className="cursor-pointer hover:bg-surface"
                >
                  <td className="px-4 py-2.5 text-ink">{u.name || '—'}</td>
                  <td className="px-4 py-2.5 text-ink">{u.email}</td>
                  <td className="px-4 py-2.5 text-ink">
                    {u.segment ? (
                      <span className="rounded-full bg-surface px-2 py-0.5 text-xs">
                        {SEGMENT_ICON[u.segment]} {u.segment}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-ink">{u.plan}</td>
                  <td className="px-4 py-2.5 text-ink-soft">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={u.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {selectedUserId && (
        <UserDrawer userId={selectedUserId} onClose={() => setSelectedUserId(null)} onChanged={load} />
      )}
    </div>
  );
}
