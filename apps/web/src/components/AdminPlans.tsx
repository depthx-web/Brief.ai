'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/AdminAuthContext';
import {
  fetchAdminPlanPrices,
  updateAdminPlanPrice,
  fetchAdminFeatures,
  updateAdminFeature,
  type AdminPlanPrice,
  type AdminFeature,
  type AdminSegment,
  type AdminBillingCycle,
} from '@/lib/adminApi';

const SEGMENTS: AdminSegment[] = ['LAWYER', 'ACCOUNTANT', 'RESEARCHER'];
const SEGMENT_LABEL: Record<AdminSegment, string> = {
  LAWYER: 'Lawyer',
  ACCOUNTANT: 'Accountant',
  RESEARCHER: 'Researcher',
};
const CYCLES: AdminBillingCycle[] = ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'];
const CYCLE_LABEL: Record<AdminBillingCycle, string> = {
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  YEARLY: 'Yearly',
};

function formatDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

export default function AdminPlans() {
  const { token } = useAdminAuth();
  const [prices, setPrices] = useState<AdminPlanPrice[]>([]);
  const [features, setFeatures] = useState<AdminFeature[]>([]);
  const [priceEdits, setPriceEdits] = useState<Record<string, number>>({});
  const [featureEdits, setFeatureEdits] = useState<Record<string, { freeEnabled?: boolean; proEnabled?: boolean }>>({});
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    if (!token) return;
    setIsLoading(true);
    Promise.all([fetchAdminPlanPrices(token), fetchAdminFeatures(token)])
      .then(([p, f]) => {
        setPrices(p);
        setFeatures(f);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load plans.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, [token]);

  const dirty = Object.keys(priceEdits).length > 0 || Object.keys(featureEdits).length > 0;

  function priceFor(segment: AdminSegment, cycle: AdminBillingCycle): number {
    const key = `${segment}:${cycle}`;
    if (key in priceEdits) return priceEdits[key];
    return prices.find((p) => p.segment === segment && p.cycle === cycle)?.priceCents ?? 0;
  }

  function handlePriceChange(segment: AdminSegment, cycle: AdminBillingCycle, dollars: string) {
    const cents = Math.round(parseFloat(dollars || '0') * 100);
    if (Number.isNaN(cents) || cents < 0) return;
    setPriceEdits((prev) => ({ ...prev, [`${segment}:${cycle}`]: cents }));
  }

  function toggleFeature(feature: AdminFeature, field: 'freeEnabled' | 'proEnabled') {
    const current = featureEdits[feature.id]?.[field] ?? feature[field];
    setFeatureEdits((prev) => ({
      ...prev,
      [feature.id]: { ...prev[feature.id], [field]: !current },
    }));
  }

  async function handleSave() {
    if (!token) return;
    setIsSaving(true);
    setError(null);
    try {
      await Promise.all([
        ...Object.entries(priceEdits).map(([key, priceCents]) => {
          const [segment, cycle] = key.split(':') as [AdminSegment, AdminBillingCycle];
          return updateAdminPlanPrice(token, segment, cycle, priceCents);
        }),
        ...Object.entries(featureEdits).map(([id, data]) => updateAdminFeature(token, id, data)),
      ]);
      setPriceEdits({});
      setFeatureEdits({});
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <div className="px-8 py-10 text-sm text-ink-soft">Loading…</div>;

  return (
    <div className="mx-auto max-w-5xl px-8 py-10 pb-24">
      <h1 className="font-serif text-2xl font-medium text-navy">Plans & Pricing</h1>
      {error && <p className="mt-3 text-sm text-redline">{error}</p>}

      <div className="mt-6 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-gray-200 text-xs uppercase text-ink-soft">
            <tr>
              <th className="px-4 py-2">Cycle</th>
              {SEGMENTS.map((s) => (
                <th key={s} className="px-4 py-2">
                  {SEGMENT_LABEL[s]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {CYCLES.map((cycle) => (
              <tr key={cycle}>
                <td className="px-4 py-2.5 font-medium text-ink">{CYCLE_LABEL[cycle]}</td>
                {SEGMENTS.map((segment) => {
                  const cellKey = `${segment}:${cycle}`;
                  const isEditing = editingCell === cellKey;
                  return (
                    <td key={segment} className="px-4 py-2.5">
                      {isEditing ? (
                        <input
                          autoFocus
                          type="number"
                          step="0.01"
                          defaultValue={formatDollars(priceFor(segment, cycle))}
                          onBlur={(e) => {
                            handlePriceChange(segment, cycle, e.target.value);
                            setEditingCell(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                          }}
                          className="w-24 rounded-md border-2 border-emerald px-2 py-1 font-mono text-sm"
                        />
                      ) : (
                        <button
                          onClick={() => setEditingCell(cellKey)}
                          className="rounded-md px-2 py-1 font-mono text-sm text-ink hover:bg-surface"
                        >
                          ${formatDollars(priceFor(segment, cycle))}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 space-y-8">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Features per plan
        </h2>
        {SEGMENTS.map((segment) => {
          const segmentFeatures = features.filter((f) => f.segment === segment);
          if (segmentFeatures.length === 0) return null;
          return (
            <div key={segment}>
              <h3 className="font-serif text-base font-semibold text-navy">{SEGMENT_LABEL[segment]}</h3>
              <div className="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white">
                <div className="grid grid-cols-3 border-b border-gray-200 bg-surface px-4 py-2 text-xs font-semibold uppercase text-ink-soft">
                  <span>Feature</span>
                  <span className="text-center">Free</span>
                  <span className="text-center">Pro</span>
                </div>
                {segmentFeatures.map((feature) => {
                  const freeEnabled = featureEdits[feature.id]?.freeEnabled ?? feature.freeEnabled;
                  const proEnabled = featureEdits[feature.id]?.proEnabled ?? feature.proEnabled;
                  return (
                    <div
                      key={feature.id}
                      className="grid grid-cols-3 items-center border-b border-gray-100 px-4 py-3 text-sm last:border-b-0"
                    >
                      <span className="text-ink">{feature.label}</span>
                      <span className="flex justify-center">
                        <button
                          onClick={() => toggleFeature(feature, 'freeEnabled')}
                          className={`h-5 w-9 rounded-full transition-colors ${freeEnabled ? 'bg-emerald' : 'bg-gray-300'}`}
                        >
                          <span
                            className={`block h-4 w-4 translate-y-0.5 rounded-full bg-white transition-transform ${
                              freeEnabled ? 'translate-x-4' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </span>
                      <span className="flex justify-center">
                        <button
                          onClick={() => toggleFeature(feature, 'proEnabled')}
                          className={`h-5 w-9 rounded-full transition-colors ${proEnabled ? 'bg-emerald' : 'bg-gray-300'}`}
                        >
                          <span
                            className={`block h-4 w-4 translate-y-0.5 rounded-full bg-white transition-transform ${
                              proEnabled ? 'translate-x-4' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {dirty && (
        <div className="fixed bottom-0 left-[260px] right-0 flex items-center justify-between bg-navy px-8 py-4 shadow-2xl">
          <span className="text-sm text-white">You have unsaved changes.</span>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-emerald px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      )}
    </div>
  );
}
