'use client';

import { useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/AdminAuthContext';
import {
  fetchAdminEmailCampaigns,
  updateAdminEmailCampaign,
  type AdminEmailCampaign,
  type AdminEmailCampaignKey,
} from '@/lib/adminApi';

const CAMPAIGN_META: Record<AdminEmailCampaignKey, { icon: string; title: string; description: string }> = {
  WELCOME: { icon: '👋', title: 'Welcome email', description: 'Sent automatically after account creation.' },
  UPGRADE: {
    icon: '⬆️',
    title: 'Upgrade confirmation',
    description: 'Sent when a subscription is created or the billing cycle changes.',
  },
  WINBACK: {
    icon: '💌',
    title: 'Win-back',
    description: 'Sent automatically 14 days after a subscription cancels, with an auto-generated discount code.',
  },
  SECURITY: {
    icon: '🛡️',
    title: 'Security change notification',
    description: 'Sent automatically whenever a password or email address is changed.',
  },
};

function EditorModal({
  campaign,
  onClose,
  onSaved,
}: {
  campaign: AdminEmailCampaign;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { token } = useAdminAuth();
  const [subject, setSubject] = useState(campaign.subject);
  const [body, setBody] = useState(campaign.body);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    if (!token) return;
    setIsSaving(true);
    setError(null);
    try {
      await updateAdminEmailCampaign(token, campaign.id, { subject, body });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="overlay-dim fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="animate-modal-in flex max-h-[85vh] w-full max-w-4xl flex-col rounded-[14px] bg-white p-8 shadow-level-4">
        <h2 className="font-serif text-xl font-semibold text-navy">
          Edit {CAMPAIGN_META[campaign.key].title}
        </h2>

        <div className="mt-4 grid flex-1 grid-cols-2 gap-6 overflow-hidden">
          <div className="flex flex-col overflow-y-auto pr-2">
            <label className="text-sm font-medium text-ink">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <label className="mt-4 text-sm font-medium text-ink">
              Body (HTML — {'{{NAME}}'}, {'{{DASHBOARD_URL}}'}, {'{{PLAN_CYCLE}}'}, {'{{DISCOUNT_CODE}}'},{' '}
              {'{{PRICING_URL}}'}, {'{{CHANGE_TYPE}}'} available depending on the email)
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={16}
              className="mt-1 w-full flex-1 rounded-md border border-gray-300 px-3 py-2 font-mono text-xs"
            />
          </div>

          <div className="flex flex-col overflow-hidden">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Preview</p>
            <div className="mt-1 flex-1 overflow-y-auto rounded-lg border border-gray-200 bg-surface p-4">
              <div className="rounded border border-gray-200 bg-white p-2 text-xs text-ink-soft">
                Subject: {subject}
              </div>
              <div className="mt-2" dangerouslySetInnerHTML={{ __html: body }} />
            </div>
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-redline">{error}</p>}

        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-emerald px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? 'Saving…' : 'Save changes'}
          </button>
          <button onClick={onClose} className="text-sm font-medium text-ink-soft hover:text-ink">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminEmails() {
  const { token } = useAdminAuth();
  const [campaigns, setCampaigns] = useState<AdminEmailCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState<AdminEmailCampaign | null>(null);

  function load() {
    if (!token) return;
    setIsLoading(true);
    fetchAdminEmailCampaigns(token)
      .then(setCampaigns)
      .finally(() => setIsLoading(false));
  }

  useEffect(load, [token]);

  async function toggleEnabled(campaign: AdminEmailCampaign) {
    if (!token) return;
    await updateAdminEmailCampaign(token, campaign.id, { enabled: !campaign.enabled });
    load();
  }

  if (isLoading) return <div className="px-8 py-10 text-sm text-ink-soft">Loading…</div>;

  return (
    <div className="mx-auto max-w-4xl px-8 py-10">
      <h1 className="font-serif text-2xl font-medium text-navy">Email campaigns</h1>

      <div className="mt-6 space-y-4">
        {campaigns.map((campaign) => {
          const meta = CAMPAIGN_META[campaign.key];
          return (
            <div
              key={campaign.id}
              className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl" aria-hidden>
                  {meta.icon}
                </span>
                <div>
                  <p className="font-medium text-navy">{meta.title}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">{meta.description}</p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  onClick={() => setEditing(campaign)}
                  className="rounded-md border border-gray-200 px-3 py-1.5 text-xs font-medium text-ink hover:border-gray-300"
                >
                  Edit content
                </button>
                <button
                  onClick={() => toggleEnabled(campaign)}
                  className={`h-5 w-9 rounded-full transition-colors ${campaign.enabled ? 'bg-emerald' : 'bg-gray-300'}`}
                >
                  <span
                    className={`block h-4 w-4 translate-y-0.5 rounded-full bg-white transition-transform ${
                      campaign.enabled ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editing && <EditorModal campaign={editing} onClose={() => setEditing(null)} onSaved={load} />}
    </div>
  );
}
