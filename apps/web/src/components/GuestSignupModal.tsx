'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '@/lib/AuthContext';
import { useLocale } from '@/lib/i18n/LocaleContext';
import GoogleSignInButton from './GoogleSignInButton';

interface Props {
  open: boolean;
  onClose: () => void;
  toolName?: string;
}

// Shown in place of a redirect to /signup when a guest clicks a paid AI
// tool (Batch 4, Section 3) — they've already shown real intent by clicking
// it, so the compact form stays right over the same page instead of losing
// them to a separate flow.
export default function GuestSignupModal({ open, onClose, toolName }: Props) {
  const { signup } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consented, setConsented] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError(t('auth.passwordMinLength'));
      return;
    }
    setIsSubmitting(true);
    try {
      await signup(email.trim(), password);
      onClose();
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.couldNotCreateAccount'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay-dim fixed inset-0 z-50" />
        <Dialog.Content className="animate-modal-in fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-7 shadow-level-4">
          <Dialog.Title className="font-serif text-xl font-medium text-navy">
            {t('guestSignup.title')}
          </Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-ink-soft">
            {toolName ? t('guestSignup.toolNeedsAccount').replace('{tool}', toolName) : t('guestSignup.thisToolNeedsAccount')}
          </Dialog.Description>

          <div className="mt-5">
            <GoogleSignInButton label={t('auth.continueWithGoogle')} />
          </div>
          <div className="my-4 flex items-center gap-3 text-xs text-ink-soft">
            <span className="h-px flex-1 bg-gray-200" />
            {t('auth.or')}
            <span className="h-px flex-1 bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              placeholder={t('guestSignup.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="password"
              required
              minLength={8}
              placeholder={t('guestSignup.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {error && <p className="text-sm text-redline">{error}</p>}

            <label className="flex items-start gap-2.5 text-xs text-ink-soft">
              <input
                type="checkbox"
                checked={consented}
                onChange={(e) => setConsented(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-emerald focus:ring-emerald"
              />
              <span>
                {t('auth.consentPrefix')}{' '}
                <a href="/privacy" target="_blank" rel="noopener noreferrer" className="font-medium text-navy hover:text-emerald">
                  {t('auth.privacyPolicy')}
                </a>{' '}
                {t('auth.and')}{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="font-medium text-navy hover:text-emerald">
                  {t('auth.termsOfService')}
                </a>
              </span>
            </label>

            <button
              type="submit"
              disabled={!consented || isSubmitting}
              className="w-full rounded-lg bg-emerald px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isSubmitting ? t('auth.creatingAccount') : t('guestSignup.createAccount')}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-ink-soft">
            {t('auth.alreadyHaveAccount')}{' '}
            <a href="/login" className="font-medium text-navy hover:text-emerald">
              {t('nav.logIn')}
            </a>
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
