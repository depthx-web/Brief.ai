'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/AdminAuthContext';
import { fetchTokenEconomics, updateAdminSettings, type AdminTokenEconomics as TokenEconomicsData } from '@/lib/adminApi';

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="font-serif text-2xl font-medium text-navy">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-ink-soft">{label}</p>
    </div>
  );
}

export default function AdminTokenEconomics() {
  const { token } = useAdminAuth();
  const [data, setData] = useState<TokenEconomicsData | null>(null);
  const [rateDraft, setRateDraft] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    if (!token) return;
    setIsLoading(true);
    fetchTokenEconomics(token)
      .then((res) => {
        setData(res);
        setRateDraft(String(res.tokensPerDollar));
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load token economics.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, [token]);

  async function handleSaveRate() {
    if (!token) return;
    const value = Number(rateDraft);
    if (!Number.isFinite(value) || value <= 0) {
      setError('Tokens per $1 must be a positive number.');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await updateAdminSettings(token, { tokensPerDollar: value });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save the conversion rate.');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) return <div className="px-8 py-10 text-sm text-ink-soft">Loading…</div>;
  if (!data) return null;

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <h1 className="font-serif text-2xl font-medium text-navy">Token Economics</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Conversion rate and live usage across AI-usage credit deductions and pay-as-you-go pricing.
      </p>
      {error && <p className="mt-3 text-sm text-redline">{error}</p>}

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
        <label className="block text-sm font-medium text-ink">Tokens per $1</label>
        <p className="mt-1 text-xs text-ink-soft">
          Drives credit-pack pricing and AI-usage-to-credit math platform-wide. Changing this does not
          retroactively alter past transactions.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <input
            type="number"
            min={1}
            value={rateDraft}
            onChange={(e) => setRateDraft(e.target.value)}
            className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            onClick={handleSaveRate}
            disabled={isSaving || rateDraft === String(data.tokensPerDollar)}
            className="rounded-lg bg-emerald px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {isSaving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile label="Today's usage (all users)" value={data.todayUsage} />
        <StatTile
          label="Remaining provider balance"
          value={data.providerBalanceAvailable ? (data.providerBalance ?? '—') : 'Not available from provider'}
        />
        <StatTile label="Credits sold (outstanding)" value={data.totalCreditsOutstanding} />
      </div>
      {!data.providerBalanceAvailable && (
        <p className="mt-3 text-xs text-ink-soft">
          No AI provider integrated here (Anthropic/OpenAI/Gemini/DeepSeek) exposes a queryable remaining-balance
          API — this is an honest gap, not a loading state.
        </p>
      )}
    </div>
  );
}
