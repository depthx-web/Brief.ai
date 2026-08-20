'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/AdminAuthContext';
import {
  fetchAdminPlanPrices,
  updateAdminPlanPrice,
  fetchAdminFeatures,
  updateAdminFeature,
  fetchAdminSettings,
  updateAdminSettings,
  fetchAdminCreditPacks,
  createAdminCreditPack,
  updateAdminCreditPack,
  setAdminCreditPackBestValue,
  deleteAdminCreditPack,
  type AdminPlanPrice,
  type AdminFeature,
  type AdminSegment,
  type AdminBillingCycle,
  type AdminCreditPack,
} from '@/lib/adminApi';
import { showError, showSuccess } from '@/lib/toast';

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

// Tools with no segment (available to every workspace) don't have a "tab"
// field in the Feature table itself — this mirrors the Tools page's own
// Convert/Organize/Protect grouping purely for admin display, the same way
// SEGMENT_LABEL above is a display-only mapping, not a stored field.
const GLOBAL_TOOL_GROUPS: Record<string, string> = {
  WORD_TO_PDF: 'Convert',
  PDF_TO_WORD: 'Convert',
  EXCEL_TO_PDF: 'Convert',
  PDF_TO_EXCEL: 'Convert',
  POWERPOINT_TO_PDF: 'Convert',
  PDF_TO_POWERPOINT: 'Convert',
  PDF_TO_HTML: 'Convert',
  COMPRESS_HIGH_RATIO: 'Organize',
  PROTECT_PDF: 'Protect',
  REMOVE_PASSWORD: 'Protect',
};
const GLOBAL_TOOL_GROUP_ORDER = ['Convert', 'Organize', 'Protect'];

function formatDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

// The public Pricing page always shows a fixed "Save 10%/20%" badge on
// Quarterly/Yearly (apps/api/src/billing/pricing.service.ts's
// CYCLE_DISCOUNT_LABEL) rather than computing it from the actual saved
// price — a deliberate choice so an admin-edited price never makes the
// badge disappear, but it means a price that ISN'T actually a 10%/20%
// discount off Monthly will silently show a badge that lies. This warns
// in the one place that can catch it before it goes live.
const CYCLE_MONTHS: Partial<Record<AdminBillingCycle, number>> = { QUARTERLY: 3, YEARLY: 12 };
const CYCLE_DISCOUNT_PERCENT: Partial<Record<AdminBillingCycle, number>> = { QUARTERLY: 10, YEARLY: 20 };

function discountMismatch(monthlyCents: number, cycle: AdminBillingCycle, actualCents: number): boolean {
  const months = CYCLE_MONTHS[cycle];
  const discountPercent = CYCLE_DISCOUNT_PERCENT[cycle];
  if (!months || !discountPercent || !monthlyCents) return false;
  const expected = Math.round(monthlyCents * months * (1 - discountPercent / 100));
  return Math.abs(actualCents - expected) > 1;
}

function FeatureTableHead() {
  return (
    <div className="grid grid-cols-3 border-b border-gray-200 bg-surface px-4 py-2 text-xs font-semibold uppercase text-ink-soft">
      <span>Feature</span>
      <span className="text-center">Free</span>
      <span className="text-center">Pro</span>
    </div>
  );
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

  const [creditsEnabled, setCreditsEnabledState] = useState(true);
  const [packs, setPacks] = useState<AdminCreditPack[]>([]);
  const [packEdits, setPackEdits] = useState<Record<string, { size?: number; priceCents?: number }>>({});
  const [editingPackCell, setEditingPackCell] = useState<string | null>(null);

  function load() {
    if (!token) return;
    setIsLoading(true);
    Promise.all([fetchAdminPlanPrices(token), fetchAdminFeatures(token), fetchAdminSettings(token), fetchAdminCreditPacks(token)])
      .then(([p, f, s, packList]) => {
        setPrices(p);
        setFeatures(f);
        setCreditsEnabledState(s.creditsEnabled);
        setPacks(packList);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load plans.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, [token]);

  const dirty = Object.keys(priceEdits).length > 0 || Object.keys(featureEdits).length > 0 || Object.keys(packEdits).length > 0;

  function packValue(pack: AdminCreditPack, field: 'size' | 'priceCents'): number {
    return packEdits[pack.id]?.[field] ?? pack[field];
  }

  async function toggleCreditsEnabled() {
    if (!token) return;
    const next = !creditsEnabled;
    setCreditsEnabledState(next);
    try {
      await updateAdminSettings(token, { creditsEnabled: next });
    } catch (err) {
      setCreditsEnabledState(!next);
      showError(err instanceof Error ? err.message : 'Could not update this setting.');
    }
  }

  async function handleSetBestValue(id: string) {
    if (!token) return;
    try {
      await setAdminCreditPackBestValue(token, id);
      setPacks((prev) => prev.map((p) => ({ ...p, isBestValue: p.id === id })));
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not update this pack.');
    }
  }

  async function handleAddPack() {
    if (!token) return;
    try {
      await createAdminCreditPack(token, 10, 1500);
      load();
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not add a pack.');
    }
  }

  async function handleDeletePack(id: string) {
    if (!token) return;
    try {
      await deleteAdminCreditPack(token, id);
      setPacks((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not delete this pack.');
    }
  }

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

  function renderFeatureRow(feature: AdminFeature) {
    const freeEnabled = featureEdits[feature.id]?.freeEnabled ?? feature.freeEnabled;
    const proEnabled = featureEdits[feature.id]?.proEnabled ?? feature.proEnabled;
    return (
      <div key={feature.id} className="grid grid-cols-3 items-center border-b border-gray-100 px-4 py-3 text-sm last:border-b-0">
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
        ...Object.entries(packEdits).map(([id, data]) => updateAdminCreditPack(token, id, data)),
      ]);
      setPriceEdits({});
      setFeatureEdits({});
      setPackEdits({});
      showSuccess('Saved successfully');
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
                  const mismatch = discountMismatch(priceFor(segment, 'MONTHLY'), cycle, priceFor(segment, cycle));
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
                          title={
                            mismatch
                              ? `The public page always shows "Save ${CYCLE_DISCOUNT_PERCENT[cycle]}%" here regardless of the actual price — this price isn't really a ${CYCLE_DISCOUNT_PERCENT[cycle]}% discount off Monthly.`
                              : undefined
                          }
                          className="flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-sm text-ink hover:bg-surface"
                        >
                          ${formatDollars(priceFor(segment, cycle))}
                          {mismatch && (
                            <span className="rounded bg-amber-100 px-1 py-0.5 font-sans text-[9px] font-semibold uppercase text-amber-700">
                              Badge mismatch
                            </span>
                          )}
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
                <FeatureTableHead />
                {segmentFeatures.map((feature) => renderFeatureRow(feature))}
              </div>
            </div>
          );
        })}

        {GLOBAL_TOOL_GROUP_ORDER.map((group) => {
          const groupFeatures = features.filter((f) => f.segment === null && GLOBAL_TOOL_GROUPS[f.key] === group);
          if (groupFeatures.length === 0) return null;
          return (
            <div key={group}>
              <h3 className="font-serif text-base font-semibold text-navy">{group} (every workspace)</h3>
              <div className="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white">
                <FeatureTableHead />
                {groupFeatures.map((feature) => renderFeatureRow(feature))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Pay-as-you-go packs</h2>
          <label className="flex items-center gap-2 text-sm text-ink">
            Enable pay-as-you-go
            <button
              onClick={toggleCreditsEnabled}
              className={`h-5 w-9 rounded-full transition-colors ${creditsEnabled ? 'bg-emerald' : 'bg-gray-300'}`}
            >
              <span
                className={`block h-4 w-4 translate-y-0.5 rounded-full bg-white transition-transform ${
                  creditsEnabled ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
          </label>
        </div>

        <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase text-ink-soft">
              <tr>
                <th className="px-4 py-2">Pack size</th>
                <th className="px-4 py-2">Price</th>
                <th className="px-4 py-2">Best value</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {packs.map((pack) => {
                const sizeCellKey = `${pack.id}:size`;
                const priceCellKey = `${pack.id}:priceCents`;
                return (
                  <tr key={pack.id}>
                    <td className="px-4 py-2.5">
                      {editingPackCell === sizeCellKey ? (
                        <input
                          autoFocus
                          type="number"
                          defaultValue={packValue(pack, 'size')}
                          onBlur={(e) => {
                            const size = parseInt(e.target.value, 10);
                            if (!Number.isNaN(size) && size > 0) {
                              setPackEdits((prev) => ({ ...prev, [pack.id]: { ...prev[pack.id], size } }));
                            }
                            setEditingPackCell(null);
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                          className="w-20 rounded-md border-2 border-emerald px-2 py-1 font-mono text-sm"
                        />
                      ) : (
                        <button onClick={() => setEditingPackCell(sizeCellKey)} className="rounded-md px-2 py-1 font-mono text-sm text-ink hover:bg-surface">
                          {packValue(pack, 'size')} credits
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {editingPackCell === priceCellKey ? (
                        <input
                          autoFocus
                          type="number"
                          step="0.01"
                          defaultValue={formatDollars(packValue(pack, 'priceCents'))}
                          onBlur={(e) => {
                            const cents = Math.round(parseFloat(e.target.value || '0') * 100);
                            if (!Number.isNaN(cents) && cents >= 0) {
                              setPackEdits((prev) => ({ ...prev, [pack.id]: { ...prev[pack.id], priceCents: cents } }));
                            }
                            setEditingPackCell(null);
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                          className="w-24 rounded-md border-2 border-emerald px-2 py-1 font-mono text-sm"
                        />
                      ) : (
                        <button onClick={() => setEditingPackCell(priceCellKey)} className="rounded-md px-2 py-1 font-mono text-sm text-ink hover:bg-surface">
                          ${formatDollars(packValue(pack, 'priceCents'))}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <button
                        onClick={() => handleSetBestValue(pack.id)}
                        className={`h-5 w-9 rounded-full transition-colors ${pack.isBestValue ? 'bg-emerald' : 'bg-gray-300'}`}
                      >
                        <span
                          className={`block h-4 w-4 translate-y-0.5 rounded-full bg-white transition-transform ${
                            pack.isBestValue ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button onClick={() => handleDeletePack(pack.id)} className="text-xs font-medium text-redline hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button onClick={handleAddPack} className="mt-3 text-sm font-medium text-emerald hover:underline">
          + Add new pack
        </button>
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
