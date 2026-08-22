'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '@/lib/AuthContext';
import { useLocale } from '@/lib/i18n/LocaleContext';
import GoogleSignInButton from './GoogleSignInButton';

interface Props {
  open: boolean;
  onClose: () => void;
}

// Desktop-only: login is never a full page there (the shell — sidebar,
// current panel — stays visible and dimmed behind it), unlike the web app's
// dedicated /login route. Follows the same Radix Dialog + overlay-dim +
// animate-modal-in pattern as GuestSignupModal, just narrower (a plain
// email/password form, not a multi-card chooser).
export default function LoginModal({ open, onClose }: Props) {
  const { login } = useAuth();
  const { t } = useLocale();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      setEmail('');
      setPassword('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.couldNotLogIn'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay-dim fixed inset-0 z-50" />
        <Dialog.Content className="animate-modal-in fixed left-1/2 top-1/2 z-50 w-full max-w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-[14px] bg-white p-7 shadow-level-4">
          <Dialog.Title className="font-serif text-xl font-medium text-navy">{t('auth.logInTitle')}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-ink-soft">
            {t('loginModal.subtitle')}
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
              autoFocus
              placeholder={t('guestSignup.emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="password"
              required
              placeholder={t('auth.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            {error && <p className="text-sm text-redline">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-lg bg-emerald px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isSubmitting ? t('auth.loggingIn') : t('auth.logInTitle')}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-ink-soft">
            {t('auth.dontHaveAccount')}{' '}
            <a href="/signup" className="font-medium text-navy hover:text-emerald">
              {t('guestSignup.createAccount')}
            </a>
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
