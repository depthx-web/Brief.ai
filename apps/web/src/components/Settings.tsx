'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import type { Segment } from '@/lib/authApi';

const SEGMENTS: { value: Segment; label: string }[] = [
  { value: 'LAWYER', label: 'Lawyer' },
  { value: 'ACCOUNTANT', label: 'Accountant' },
  { value: 'RESEARCHER', label: 'Researcher' },
];

export default function Settings() {
  const { user, updateProfile, deleteAccount } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? '');
  const [segment, setSegment] = useState<Segment | null>(user?.segment ?? null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  async function handleSave() {
    setError(null);
    setSaved(false);
    setIsSaving(true);
    try {
      await updateProfile({ name: name.trim() || undefined, segment: segment ?? undefined });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (
      !window.confirm(
        'This permanently deletes your account and every document in your library. This cannot be undone. Continue?'
      )
    ) {
      return;
    }
    setIsDeleting(true);
    setError(null);
    try {
      await deleteAccount();
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete your account.');
      setIsDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-8 py-10">
      <h1 className="font-serif text-2xl font-medium text-navy">Settings</h1>

      <section className="mt-10">
        <h2 className="font-serif text-lg font-semibold text-navy">Profile</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink">Email</label>
            <p className="mt-1 text-sm text-ink-soft">{user.email}</p>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-lg font-semibold text-navy">Professional Workspace</h2>
        <p className="mt-1 text-sm text-ink-soft">Changes which analysis view opens in the Document Workspace.</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {SEGMENTS.map((s) => (
            <button
              key={s.value}
              onClick={() => setSegment(s.value)}
              className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                segment === s.value ? 'border-emerald text-navy' : 'border-gray-200 text-ink-soft hover:border-gray-300'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </section>

      {error && <p className="mt-6 text-sm text-redline">{error}</p>}
      {saved && <p className="mt-6 text-sm text-emerald">Saved.</p>}

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="mt-6 rounded-lg bg-emerald px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isSaving ? 'Saving…' : 'Save Changes'}
      </button>

      <section className="mt-14">
        <h2 className="font-serif text-lg font-semibold text-navy">Subscription</h2>
        <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
          <div>
            <p className="text-sm font-medium text-ink">Free plan</p>
            <p className="text-xs text-ink-soft">Billing isn&apos;t live yet — everything is free while we finish it.</p>
          </div>
          <a href="/pricing" className="text-sm font-medium text-navy hover:text-emerald">
            View plans
          </a>
        </div>
      </section>

      <section className="mt-14 border-t border-gray-200 pt-8">
        <h2 className="font-serif text-lg font-semibold text-navy">Privacy</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Permanently delete your account and every document in your library.
        </p>
        <button
          onClick={handleDeleteAccount}
          disabled={isDeleting}
          className="mt-4 rounded-lg border border-redline px-5 py-2.5 text-sm font-medium text-redline transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isDeleting ? 'Deleting…' : 'Delete all my data'}
        </button>
      </section>
    </div>
  );
}
