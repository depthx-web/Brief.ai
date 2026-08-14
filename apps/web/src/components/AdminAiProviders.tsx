'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/AdminAuthContext';
import {
  fetchAdminAiProviders,
  updateAdminRoutingRule,
  type AdminAiProvidersResponse,
  type AdminTaskAlias,
} from '@/lib/adminApi';

const ALIAS_LABEL: Record<AdminTaskAlias, string> = {
  'task-simple': 'Simple (extraction, classification, short summaries)',
  'task-complex': 'Complex (clause analysis, financial audit)',
};

export default function AdminAiProviders() {
  const { token } = useAdminAuth();
  const [data, setData] = useState<AdminAiProvidersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savingAlias, setSavingAlias] = useState<AdminTaskAlias | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    if (!token) return;
    setIsLoading(true);
    fetchAdminAiProviders(token)
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load AI providers.'))
      .finally(() => setIsLoading(false));
  }

  useEffect(load, [token]);

  async function handleRoutingChange(alias: AdminTaskAlias, model: string) {
    if (!token) return;
    setSavingAlias(alias);
    setError(null);
    try {
      await updateAdminRoutingRule(token, alias, model);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update routing rule.');
    } finally {
      setSavingAlias(null);
    }
  }

  if (isLoading) return <div className="px-8 py-10 text-sm text-ink-soft">Loading…</div>;
  if (!data) return null;

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <h1 className="font-serif text-2xl font-medium text-navy">AI providers</h1>
      {!data.configured && (
        <p className="mt-2 text-sm text-ink-soft">
          The LiteLLM routing proxy isn&apos;t reachable — routing rules can&apos;t be edited until it is.
        </p>
      )}
      {error && <p className="mt-3 text-sm text-redline">{error}</p>}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {data.providers.map((p) => (
          <div key={p.envVar} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="font-medium text-navy">{p.name}</p>
              <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
                <span className={`h-1.5 w-1.5 rounded-full ${p.configured ? 'bg-emerald' : 'bg-gray-300'}`} />
                {p.configured ? 'Connected' : 'Not configured'}
              </span>
            </div>
            <p className="mt-2 font-mono text-xs text-ink-soft">{p.maskedKey ?? 'No key set'}</p>
            <p className="mt-3 text-xs text-ink-soft">
              Set via the <span className="font-mono">{p.envVar}</span> environment variable on the API and
              LiteLLM services — not editable from here for security.
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Routing rules</h2>
        <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white">
          {data.routingRules.map((rule) => (
            <div
              key={rule.alias}
              className="flex items-center justify-between gap-4 border-b border-gray-100 px-4 py-3 text-sm last:border-b-0"
            >
              <div>
                <p className="font-mono text-xs uppercase text-ink-soft">{rule.alias}</p>
                <p className="text-ink">{ALIAS_LABEL[rule.alias]}</p>
              </div>
              <select
                value={rule.model}
                disabled={!data.configured || savingAlias === rule.alias}
                onChange={(e) => handleRoutingChange(rule.alias, e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-1.5 font-mono text-xs"
              >
                {!data.modelChoices.some((c) => c.model === rule.model) && (
                  <option value={rule.model}>{rule.model}</option>
                )}
                {data.modelChoices.map((c) => (
                  <option key={c.model} value={c.model}>
                    {c.label} ({c.model})
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
