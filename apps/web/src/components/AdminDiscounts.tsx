'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/AdminAuthContext';
import {
  fetchAdminDiscountCodes,
  createAdminDiscountCode,
  revokeAdminDiscountCode,
  type AdminDiscountCode,
  type AdminDiscountType,
  type AdminSegment,
} from '@/lib/adminApi';

const SEGMENTS: AdminSegment[] = ['LAWYER', 'ACCOUNTANT', 'RESEARCHER'];
const SEGMENT_LABEL: Record<AdminSegment, string> = {
  LAWYER: 'Lawyer',
  ACCOUNTANT: 'Accountant',
  RESEARCHER: 'Researcher',
};

function StatusBadge({ status }: { status: AdminDiscountCode['status'] }) {
  const styles: Record<AdminDiscountCode['status'], string> = {
    active: 'bg-emerald-soft text-emerald',
    expired: 'bg-gray-100 text-gray-500',
    revoked: 'bg-gray-100 text-gray-500',
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${styles[status]}`}>
      {status}
    </span>
  );
}

function NewCodeModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { token } = useAdminAuth();
  const [code, setCode] = useState(`BRIEF${Math.floor(10 + Math.random() * 90)}`);
  const [type, setType] = useState<AdminDiscountType>('PERCENT');
  const [value, setValue] = useState('20');
  const [expiresAt, setExpiresAt] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [segments, setSegments] = useState<AdminSegment[]>(SEGMENTS);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleSegment(segment: AdminSegment) {
    setSegments((prev) => (prev.includes(segment) ? prev.filter((s) => s !== segment) : [...prev, segment]));
  }

  async function handleCreate() {
    if (!token) return;
    setIsSaving(true);
    setError(null);
    try {
      await createAdminDiscountCode(token, {
        code,
        type,
        value: parseFloat(value),
        expiresAt: expiresAt || undefined,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : undefined,
        applicableSegments: segments,
      });
      onCreated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create code.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(15,35,64,0.6)] p-4">
      <div className="w-full max-w-[640px] rounded-[14px] bg-white p-8 shadow-2xl">
        <h2 className="font-serif text-xl font-semibold text-navy">New discount code</h2>

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink">Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink">Discount type</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {(['PERCENT', 'FIXED'] as AdminDiscountType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                    type === t ? 'border-emerald bg-emerald text-white' : 'border-gray-200 text-ink-soft'
                  }`}
                >
                  {t === 'PERCENT' ? 'Percentage' : 'Fixed amount'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink">
                Value {type === 'PERCENT' ? '(%)' : '(cents)'}
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink">Usage limit (optional)</label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="Unlimited"
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink">Expiry date (optional)</label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink">Applicable workspaces</label>
            <div className="mt-1 flex gap-4">
              {SEGMENTS.map((s) => (
                <label key={s} className="flex items-center gap-2 text-sm text-ink">
                  <input type="checkbox" checked={segments.includes(s)} onChange={() => toggleSegment(s)} />
                  {SEGMENT_LABEL[s]}
                </label>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-redline">{error}</p>}

        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={handleCreate}
            disabled={isSaving || !code.trim()}
            className="rounded-lg bg-emerald px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSaving ? 'Creating…' : 'Create code'}
          </button>
          <button onClick={onClose} className="text-sm font-medium text-ink-soft hover:text-ink">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDiscounts() {
  const { token } = useAdminAuth();
  const [codes, setCodes] = useState<AdminDiscountCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  function load() {
    if (!token) return;
    setIsLoading(true);
    fetchAdminDiscountCodes(token)
      .then(setCodes)
      .finally(() => setIsLoading(false));
  }

  useEffect(load, [token]);

  async function handleRevoke(id: string) {
    if (!token) return;
    await revokeAdminDiscountCode(token, id);
    load();
  }

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium text-navy">Discount codes</h1>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-md bg-emerald px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-dark"
        >
          New code
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <p className="px-4 py-6 text-sm text-ink-soft">Loading…</p>
        ) : codes.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink-soft">No discount codes yet.</p>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase text-ink-soft">
              <tr>
                <th className="px-4 py-2">Code</th>
                <th className="px-4 py-2">Discount</th>
                <th className="px-4 py-2">Segments</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Usage</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {codes.map((c) => (
                <tr key={c.id}>
                  <td className="px-4 py-2.5 font-mono text-ink">{c.code}</td>
                  <td className="px-4 py-2.5 text-ink">
                    {c.type === 'PERCENT' ? `${c.value}%` : `$${(c.value / 100).toFixed(2)}`}
                  </td>
                  <td className="px-4 py-2.5 text-ink-soft">
                    {c.applicableSegments.map((s) => SEGMENT_LABEL[s]).join(', ')}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-2.5 text-ink-soft">
                    {c.usageCount}
                    {c.usageLimit ? ` / ${c.usageLimit}` : ''}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {c.status === 'active' && (
                      <button
                        onClick={() => handleRevoke(c.id)}
                        className="text-xs font-medium text-redline hover:underline"
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && <NewCodeModal onClose={() => setShowModal(false)} onCreated={load} />}
    </div>
  );
}
