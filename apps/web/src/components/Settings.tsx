'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '@/lib/AuthContext';
import { isTauri } from '@/lib/platform';
import type { Segment } from '@/lib/authApi';
import { fetchMyActivity, type AiActivity } from '@/lib/aiApi';
import { getBillingPortalUrl } from '@/lib/billingApi';
import { showError, showSuccess } from '@/lib/toast';

const SEGMENTS: { value: Segment; label: string }[] = [
  { value: 'LAWYER', label: 'Lawyer' },
  { value: 'ACCOUNTANT', label: 'Accountant' },
  { value: 'RESEARCHER', label: 'Researcher' },
];

const CYCLE_LABEL: Record<string, string> = {
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  YEARLY: 'Yearly',
};

const OPERATION_LABELS: Record<string, string> = {
  SUMMARIZE: 'Summarize',
  CHAT: 'Ask a question',
  ANALYZE_CLAUSES: 'Contract analysis',
  EXTRACT_REFERENCES: 'Reference extraction',
  EXTRACT_INVOICE: 'Invoice extraction',
};

export default function Settings() {
  const { user, token, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activity, setActivity] = useState<AiActivity | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetchMyActivity(token)
      .then((result) => {
        if (!cancelled) setActivity(result);
      })
      .catch((err) => {
        if (!cancelled) setActivityError(err instanceof Error ? err.message : 'Could not load activity.');
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!user) return null;

  async function handleOpenPortal() {
    if (!token) return;
    setPortalError(null);
    setIsOpeningPortal(true);
    try {
      const url = await getBillingPortalUrl(token);
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not open billing.';
      setPortalError(message);
      showError(message);
    } finally {
      setIsOpeningPortal(false);
    }
  }

  async function handleSave() {
    setError(null);
    setSaved(false);
    setIsSaving(true);
    try {
      await updateProfile({ name: name.trim() || undefined });
      setSaved(true);
      showSuccess('Saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save changes.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={isTauri() ? 'px-8 py-7' : 'mx-auto max-w-2xl px-8 py-10'}>
      <h1 className="font-serif text-2xl font-medium text-navy">Settings</h1>

      <section className="mt-8">
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
        </div>
      </section>

      <section className="mt-8 border-t border-[#EEF1F4] pt-8">
        <h2 className="font-serif text-lg font-semibold text-navy">Professional Workspace</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Set at registration and locked from then on — it determines which analysis view opens in the Document
          Workspace. You can still change your plan below.
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {SEGMENTS.map((s) => (
            <div
              key={s.value}
              className={`rounded-lg border-2 px-4 py-3 text-sm font-medium ${
                user.segment === s.value ? 'border-emerald bg-emerald-soft text-navy' : 'border-gray-200 text-ink-soft/50'
              }`}
            >
              {s.label}
            </div>
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

      <ChangeEmailSection currentEmail={user.email} />
      <ChangePasswordSection />

      <section className="mt-8 border-t border-[#EEF1F4] pt-8">
        <h2 className="font-serif text-lg font-semibold text-navy">Subscription</h2>
        <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
          <div>
            <p className="text-sm font-medium text-ink">
              {user.plan === 'PAID' ? `${CYCLE_LABEL[user.billingCycle ?? 'MONTHLY']} plan` : 'Free plan'}
            </p>
            {user.plan !== 'PAID' && (
              <p className="text-xs text-ink-soft">Billing address and payment method are set up when you subscribe.</p>
            )}
          </div>
          <a href="/pricing" className="text-sm font-medium text-navy hover:text-emerald">
            {user.plan === 'PAID' ? 'Change plan' : 'View plans'}
          </a>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
          <div>
            <p className="text-sm font-medium text-ink">Billing details</p>
            <p className="text-xs text-ink-soft">
              {user.plan === 'PAID'
                ? 'Payment method, billing address, and invoices — managed securely by our payment processor.'
                : 'Available once you have an active subscription.'}
            </p>
          </div>
          {user.plan === 'PAID' && (
            <button
              onClick={handleOpenPortal}
              disabled={isOpeningPortal}
              className="text-sm font-medium text-navy hover:text-emerald disabled:cursor-not-allowed disabled:text-gray-300"
            >
              {isOpeningPortal ? 'Opening…' : 'Manage billing →'}
            </button>
          )}
        </div>
        {portalError && <p className="mt-2 text-xs text-redline">{portalError}</p>}
      </section>

      <section className="mt-8 border-t border-[#EEF1F4] pt-8">
        <h2 className="font-serif text-lg font-semibold text-navy">Activity</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {user.segment === 'LAWYER'
            ? 'An audit log of AI operations run on your documents.'
            : 'Your recent AI usage, including this month’s total.'}
        </p>

        {activityError && <p className="mt-4 text-sm text-redline">{activityError}</p>}

        {activity && (
          <>
            <p className="mt-4 text-sm font-medium text-ink">
              {activity.monthlyCount} AI {activity.monthlyCount === 1 ? 'operation' : 'operations'} in the last 30 days
            </p>
            {activity.jobs.length === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">No AI activity yet.</p>
            ) : (
              <ul className="mt-3 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
                {activity.jobs.map((job) => (
                  <li key={job.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-ink">{OPERATION_LABELS[job.operation] ?? job.operation}</span>
                    <span className="flex items-center gap-3">
                      <span
                        className={
                          job.status === 'FAILED'
                            ? 'text-redline'
                            : job.status === 'SUCCESS'
                              ? 'text-emerald'
                              : 'text-ink-soft'
                        }
                      >
                        {job.status === 'SUCCESS' ? 'Success' : job.status === 'FAILED' ? 'Failed' : 'Processing'}
                      </span>
                      <span className="text-ink-soft">{new Date(job.createdAt).toLocaleString()}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <DeleteAccountSection />
    </div>
  );
}

function ChangeEmailSection({ currentEmail }: { currentEmail: string }) {
  const { changeEmail } = useAuth();
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await changeEmail(newEmail.trim(), password);
      showSuccess('Saved successfully');
      setNewEmail('');
      setPassword('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not change your email.';
      setError(message);
      showError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mt-8 border-t border-[#EEF1F4] pt-8">
      <h2 className="font-serif text-lg font-semibold text-navy">Email address</h2>
      <p className="mt-1 text-sm text-ink-soft">Currently {currentEmail}.</p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-ink">New email</label>
          <input
            type="email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">Current password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-redline">{error}</p>}
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSaving ? 'Saving…' : 'Update email'}
        </button>
      </form>
    </section>
  );
}

function ChangePasswordSection() {
  const { changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    setIsSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      showSuccess('Saved successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not change your password.';
      setError(message);
      showError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mt-8 border-t border-[#EEF1F4] pt-8">
      <h2 className="font-serif text-lg font-semibold text-navy">Password</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-ink">Current password</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">New password</label>
          <input
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">Confirm new password</label>
          <input
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-redline">{error}</p>}
        <button
          type="submit"
          disabled={isSaving}
          className="rounded-lg bg-navy px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isSaving ? 'Saving…' : 'Update password'}
        </button>
      </form>
    </section>
  );
}

const RETENTION_OPTIONS: { value: number; label: string; proOnly?: boolean }[] = [
  { value: 24, label: '24 hours' },
  { value: 24 * 7, label: '7 days' },
  { value: 24 * 30, label: '30 days' },
  { value: 0, label: 'Never', proOnly: true },
];

function DeleteAccountSection() {
  const { user, deleteAccount, updateProfile } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSavingRetention, setIsSavingRetention] = useState(false);

  async function handleConfirmDelete() {
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

  async function handleRetentionChange(value: number) {
    setIsSavingRetention(true);
    try {
      await updateProfile({ defaultRetentionHours: value });
      showSuccess('Saved successfully');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not save your default retention.');
    } finally {
      setIsSavingRetention(false);
    }
  }

  const currentRetention = user?.defaultRetentionHours ?? 24;
  const isPaid = user?.plan === 'PAID';

  return (
    <section className="mt-8 border-t border-[#EEF1F4] pt-8">
      <h2 className="font-serif text-lg font-semibold text-navy">Privacy</h2>

      <div className="mt-4">
        <p className="text-sm font-medium text-ink">Default file retention</p>
        <p className="mt-1 text-sm text-ink-soft">
          How long a newly uploaded file is kept before it&apos;s automatically deleted. You can still
          override this for an individual upload.
        </p>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {RETENTION_OPTIONS.map((opt) => {
            const locked = opt.proOnly && !isPaid;
            const active = currentRetention === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                disabled={locked || isSavingRetention}
                onClick={() => handleRetentionChange(opt.value)}
                title={locked ? 'Available on paid plans' : undefined}
                className={`relative rounded-lg border-2 px-3 py-2.5 text-center text-xs font-medium transition-colors ${
                  active
                    ? 'border-emerald bg-emerald-soft text-navy'
                    : locked
                      ? 'cursor-not-allowed border-gray-200 text-ink-soft/40'
                      : 'border-gray-200 text-ink-soft hover:border-gray-300'
                }`}
              >
                {locked && (
                  <span className="absolute -top-2 -right-2 rounded bg-navy-light px-1 py-0.5 font-mono text-[8px] font-semibold text-white">
                    PRO
                  </span>
                )}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-8 text-sm text-ink-soft">
        Permanently delete your account and every document in your library.
      </p>
      <button
        onClick={() => setOpen(true)}
        className="mt-4 rounded-lg border border-redline px-5 py-2.5 text-sm font-medium text-redline transition-colors hover:bg-red-50"
      >
        Delete account
      </button>

      <Dialog.Root
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setConfirmText('');
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="overlay-dim fixed inset-0 z-50" />
          <Dialog.Content className="animate-modal-in fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-7 shadow-level-4">
            <Dialog.Title className="font-serif text-lg font-semibold text-redline">
              This action is final and cannot be undone
            </Dialog.Title>
            <Dialog.Description className="mt-3 text-sm text-ink-soft">
              Deleting your account permanently removes every project and document in your library,
              cancels any active subscription, and erases your account data. There is no way to
              recover it afterward.
            </Dialog.Description>

            <label className="mt-6 block text-sm font-medium text-ink">
              Type <span className="font-mono text-redline">delete</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              autoFocus
              className="mt-1.5 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />

            {error && <p className="mt-3 text-sm text-redline">{error}</p>}

            <div className="mt-6 flex justify-end gap-3">
              <Dialog.Close asChild>
                <button className="text-sm font-medium text-ink-soft hover:text-ink">Cancel</button>
              </Dialog.Close>
              <button
                onClick={handleConfirmDelete}
                disabled={confirmText !== 'delete' || isDeleting}
                className="rounded-lg bg-redline px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isDeleting ? 'Deleting…' : 'Confirm permanent deletion'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
