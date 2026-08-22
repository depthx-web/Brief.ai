'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '@/lib/AuthContext';
import { isTauri } from '@/lib/platform';
import type { Segment } from '@/lib/authApi';
import { fetchMyActivity, type AiActivity } from '@/lib/aiApi';
import { getBillingPortalUrl } from '@/lib/billingApi';
import { resendVerification } from '@/lib/authApi';
import { showError, showSuccess } from '@/lib/toast';
import { useLocale } from '@/lib/i18n/LocaleContext';
import type { DictionaryKey } from '@/lib/i18n/dictionaries/en';
import TeamSettings from './TeamSettings';

const SEGMENTS: { value: Segment; labelKey: DictionaryKey }[] = [
  { value: 'LAWYER', labelKey: 'settings.segmentLawyer' },
  { value: 'ACCOUNTANT', labelKey: 'settings.segmentAccountant' },
  { value: 'RESEARCHER', labelKey: 'settings.segmentResearcher' },
];

const CYCLE_LABEL_KEY: Record<string, DictionaryKey> = {
  WEEKLY: 'settings.cycleWeekly',
  MONTHLY: 'settings.cycleMonthly',
  QUARTERLY: 'settings.cycleQuarterly',
  YEARLY: 'settings.cycleYearly',
};

const OPERATION_LABEL_KEY: Record<string, DictionaryKey> = {
  SUMMARIZE: 'settings.opSummarize',
  CHAT: 'settings.opChat',
  ANALYZE_CLAUSES: 'settings.opAnalyzeClauses',
  EXTRACT_REFERENCES: 'settings.opExtractReferences',
  EXTRACT_INVOICE: 'settings.opExtractInvoice',
  DOCUMENT_DELETED: 'settings.opDocumentDeleted',
  DOCUMENT_AUTO_DELETED: 'settings.opDocumentAutoDeleted',
};

export default function Settings() {
  const { user, token, updateProfile } = useAuth();
  const { t, locale } = useLocale();
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
        if (!cancelled) setActivityError(err instanceof Error ? err.message : t('settings.couldNotLoadActivity'));
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
      const message = err instanceof Error ? err.message : t('settings.couldNotOpenBilling');
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
      showSuccess(t('projectDetail.savedSuccess'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settings.couldNotSaveChanges'));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={isTauri() ? 'px-8 py-7' : 'mx-auto max-w-2xl px-8 py-10'}>
      <h1 className="font-serif text-2xl font-medium text-navy">{t('settings.title')}</h1>

      <section className="mt-8">
        <h2 className="font-serif text-lg font-semibold text-navy">{t('settings.profile')}</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink">{t('settings.name')}</label>
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
        <h2 className="font-serif text-lg font-semibold text-navy">{t('settings.professionalWorkspace')}</h2>
        <p className="mt-1 text-sm text-ink-soft">{t('settings.workspaceLocked')}</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {SEGMENTS.map((s) => (
            <div
              key={s.value}
              className={`rounded-lg border-2 px-4 py-3 text-sm font-medium ${
                user.segment === s.value ? 'border-emerald bg-emerald-soft text-navy' : 'border-gray-200 text-ink-soft/50'
              }`}
            >
              {t(s.labelKey)}
            </div>
          ))}
        </div>
      </section>

      {error && <p className="mt-6 text-sm text-redline">{error}</p>}
      {saved && <p className="mt-6 text-sm text-emerald">{t('settings.saved')}</p>}

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="mt-6 rounded-lg bg-emerald px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {isSaving ? t('common.saving') : t('common.saveChanges')}
      </button>

      <ChangeEmailSection currentEmail={user.email} emailVerified={user.emailVerified} />
      <ChangePasswordSection />

      <section className="mt-8 border-t border-[#EEF1F4] pt-8">
        <h2 className="font-serif text-lg font-semibold text-navy">{t('settings.subscription')}</h2>
        <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
          <div>
            <p className="text-sm font-medium text-ink">
              {user.plan === 'PAID'
                ? t('settings.planCycle').replace('{cycle}', t(CYCLE_LABEL_KEY[user.billingCycle ?? 'MONTHLY']))
                : t('settings.freePlan')}
            </p>
            {user.plan !== 'PAID' && (
              <p className="text-xs text-ink-soft">{t('settings.billingSetupOnSubscribe')}</p>
            )}
          </div>
          <a href="/pricing" className="text-sm font-medium text-navy hover:text-emerald">
            {user.plan === 'PAID' ? t('settings.changePlan') : t('settings.viewPlans')}
          </a>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
          <div>
            <p className="text-sm font-medium text-ink">{t('settings.billingDetails')}</p>
            <p className="text-xs text-ink-soft">
              {user.plan === 'PAID' ? t('settings.billingDetailsBody') : t('settings.billingDetailsUnavailable')}
            </p>
          </div>
          {user.plan === 'PAID' && (
            <button
              onClick={handleOpenPortal}
              disabled={isOpeningPortal}
              className="text-sm font-medium text-navy hover:text-emerald disabled:cursor-not-allowed disabled:text-gray-300"
            >
              {isOpeningPortal ? t('settings.openingPortal') : t('settings.manageBilling')}
            </button>
          )}
        </div>
        {portalError && <p className="mt-2 text-xs text-redline">{portalError}</p>}
      </section>

      <section className="mt-8 border-t border-[#EEF1F4] pt-8">
        <h2 className="font-serif text-lg font-semibold text-navy">{t('settings.activity')}</h2>
        <p className="mt-1 text-sm text-ink-soft">
          {user.segment === 'LAWYER' ? t('settings.activityAuditLog') : t('settings.activityRecentUsage')}
        </p>

        {activityError && <p className="mt-4 text-sm text-redline">{activityError}</p>}

        {activity && (
          <>
            <p className="mt-4 text-sm font-medium text-ink">
              {t(activity.monthlyCount === 1 ? 'settings.operationsCountSingular' : 'settings.operationsCountPlural').replace(
                '{n}',
                String(activity.monthlyCount)
              )}
            </p>
            {activity.jobs.length === 0 ? (
              <p className="mt-3 text-sm text-ink-soft">{t('settings.noActivityYet')}</p>
            ) : (
              <ul className="mt-3 divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
                {activity.jobs.map((job) => (
                  <li key={job.id} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span className="text-ink">{OPERATION_LABEL_KEY[job.operation] ? t(OPERATION_LABEL_KEY[job.operation]) : job.operation}</span>
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
                        {job.status === 'SUCCESS'
                          ? t('settings.statusSuccess')
                          : job.status === 'FAILED'
                            ? t('settings.statusFailed')
                            : t('settings.statusProcessing')}
                      </span>
                      <span className="text-ink-soft">{new Date(job.createdAt).toLocaleString(locale)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <TeamSettings />

      <DeleteAccountSection />
    </div>
  );
}

function ChangeEmailSection({ currentEmail, emailVerified }: { currentEmail: string; emailVerified: boolean }) {
  const { changeEmail, token } = useAuth();
  const { t } = useLocale();
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isResending, setIsResending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSaving(true);
    try {
      await changeEmail(newEmail.trim(), password);
      showSuccess(t('projectDetail.savedSuccess'));
      setNewEmail('');
      setPassword('');
    } catch (err) {
      const message = err instanceof Error ? err.message : t('settings.couldNotChangeEmail');
      setError(message);
      showError(message);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleResend() {
    if (!token) return;
    setIsResending(true);
    try {
      await resendVerification(token);
      showSuccess(t('settings.confirmationEmailSent'));
    } catch (err) {
      showError(err instanceof Error ? err.message : t('settings.couldNotSendConfirmation'));
    } finally {
      setIsResending(false);
    }
  }

  return (
    <section className="mt-8 border-t border-[#EEF1F4] pt-8">
      <h2 className="font-serif text-lg font-semibold text-navy">{t('settings.emailAddress')}</h2>
      <p className="mt-1 text-sm text-ink-soft">{t('settings.currentlyEmail').replace('{email}', currentEmail)}</p>
      {!emailVerified && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm text-amber-800">{t('settings.emailNotVerified')}</p>
          <button
            onClick={handleResend}
            disabled={isResending}
            className="shrink-0 text-sm font-medium text-navy hover:text-emerald disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isResending ? t('settings.sending') : t('settings.resendConfirmation')}
          </button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-ink">{t('settings.newEmail')}</label>
          <input
            type="email"
            required
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">{t('settings.currentPassword')}</label>
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
          {isSaving ? t('common.saving') : t('settings.updateEmail')}
        </button>
      </form>
    </section>
  );
}

function ChangePasswordSection() {
  const { changePassword } = useAuth();
  const { t } = useLocale();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError(t('settings.passwordsDontMatch'));
      return;
    }
    setIsSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      showSuccess(t('projectDetail.savedSuccess'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const message = err instanceof Error ? err.message : t('settings.couldNotChangePassword');
      setError(message);
      showError(message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mt-8 border-t border-[#EEF1F4] pt-8">
      <h2 className="font-serif text-lg font-semibold text-navy">{t('settings.password')}</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm font-medium text-ink">{t('settings.currentPassword')}</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-ink">{t('settings.newPassword')}</label>
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
          <label className="block text-sm font-medium text-ink">{t('settings.confirmNewPassword')}</label>
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
          {isSaving ? t('common.saving') : t('settings.updatePassword')}
        </button>
      </form>
    </section>
  );
}

const RETENTION_OPTIONS: { value: number; labelKey: DictionaryKey; proOnly?: boolean }[] = [
  { value: 1, labelKey: 'settings.retention1h' },
  { value: 24 * 7, labelKey: 'settings.retention7d' },
  { value: 24 * 30, labelKey: 'settings.retention30d' },
  { value: 0, labelKey: 'settings.retentionNever', proOnly: true },
];

function DeleteAccountSection() {
  const { user, deleteAccount, updateProfile } = useAuth();
  const { t } = useLocale();
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
      setError(err instanceof Error ? err.message : t('settings.couldNotDeleteAccount'));
      setIsDeleting(false);
    }
  }

  async function handleRetentionChange(value: number) {
    setIsSavingRetention(true);
    try {
      await updateProfile({ defaultRetentionHours: value });
      showSuccess(t('projectDetail.savedSuccess'));
    } catch (err) {
      showError(err instanceof Error ? err.message : t('settings.couldNotSaveRetention'));
    } finally {
      setIsSavingRetention(false);
    }
  }

  const currentRetention = user?.defaultRetentionHours ?? 1;
  const isPaid = user?.plan === 'PAID';

  return (
    <section className="mt-8 border-t border-[#EEF1F4] pt-8">
      <h2 className="font-serif text-lg font-semibold text-navy">{t('settings.privacy')}</h2>

      <div className="mt-4">
        <p className="text-sm font-medium text-ink">{t('settings.defaultFileRetention')}</p>
        <p className="mt-1 text-sm text-ink-soft">{t('settings.retentionExplanation')}</p>
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
                title={locked ? t('settings.availableOnPaidPlans') : undefined}
                className={`relative rounded-lg border-2 px-3 py-2.5 text-center text-xs font-medium transition-colors ${
                  active
                    ? 'border-emerald bg-emerald-soft text-navy'
                    : locked
                      ? 'cursor-not-allowed border-gray-200 text-ink-soft/40'
                      : 'border-gray-200 text-ink-soft hover:border-gray-300'
                }`}
              >
                {locked && (
                  <span className="absolute -top-2 -end-2 rounded bg-navy-light px-1 py-0.5 font-mono text-[8px] font-semibold text-white">
                    {t('toolsIndex.pro')}
                  </span>
                )}
                {t(opt.labelKey)}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-8 text-sm text-ink-soft">{t('settings.deleteAccountBody')}</p>
      <button
        onClick={() => setOpen(true)}
        className="mt-4 rounded-lg border border-redline px-5 py-2.5 text-sm font-medium text-redline transition-colors hover:bg-red-50"
      >
        {t('settings.deleteAccount')}
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
              {t('settings.deleteFinalWarningTitle')}
            </Dialog.Title>
            <Dialog.Description className="mt-3 text-sm text-ink-soft">
              {t('settings.deleteFinalWarningBody')}
            </Dialog.Description>

            <label className="mt-6 block text-sm font-medium text-ink">
              {t('settings.typeDeleteToConfirm').split('{word}').map((part, i, arr) => (
                <span key={i}>
                  {part}
                  {i < arr.length - 1 && <span className="font-mono text-redline">delete</span>}
                </span>
              ))}
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
                <button className="text-sm font-medium text-ink-soft hover:text-ink">{t('settings.cancel')}</button>
              </Dialog.Close>
              <button
                onClick={handleConfirmDelete}
                disabled={confirmText !== 'delete' || isDeleting}
                className="rounded-lg bg-redline px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isDeleting ? t('settings.deleting') : t('settings.confirmPermanentDeletion')}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
