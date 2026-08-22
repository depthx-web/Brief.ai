'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { fetchInvitation, acceptInvitation, declineInvitation } from '@/lib/teamApi';
import { showError, showSuccess } from '@/lib/toast';
import { useLocale } from '@/lib/i18n/LocaleContext';

export default function TeamInviteAccept() {
  const inviteToken = useSearchParams().get('token');
  const { user, token, login } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [invitation, setInvitation] = useState<{ teamName: string; email: string } | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [isActing, setIsActing] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (!inviteToken) return;
    fetchInvitation(inviteToken)
      .then(setInvitation)
      .catch((err) => {
        setInvitation(null);
        setError(err instanceof Error ? err.message : t('teamInvite.notFound'));
      });
  }, [inviteToken]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : t('auth.couldNotLogIn'));
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleAccept() {
    if (!inviteToken || !token) return;
    setIsActing(true);
    try {
      await acceptInvitation(token, inviteToken);
      showSuccess(t('teamInvite.joinedTeamToast'));
      router.push('/dashboard');
    } catch (err) {
      showError(err instanceof Error ? err.message : t('teamInvite.couldNotAccept'));
    } finally {
      setIsActing(false);
    }
  }

  async function handleDecline() {
    if (!inviteToken) return;
    setIsActing(true);
    try {
      await declineInvitation(inviteToken);
      showSuccess(t('teamInvite.declinedToast'));
      router.push('/');
    } catch (err) {
      showError(err instanceof Error ? err.message : t('teamInvite.couldNotDecline'));
    } finally {
      setIsActing(false);
    }
  }

  if (!inviteToken) {
    return <div className="mx-auto mt-16 max-w-md px-6 text-center text-sm text-ink-soft">{t('teamInvite.noTokenProvided')}</div>;
  }
  if (invitation === undefined) return null;
  if (invitation === null) {
    return (
      <div className="mx-auto mt-16 max-w-md px-6 text-center">
        <p className="text-sm text-redline">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-16 w-full max-w-md px-6">
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        <h1 className="font-serif text-xl font-semibold text-navy">
          {t('teamInvite.acceptTitle').replace('{team}', invitation.teamName)}
        </h1>
        <p className="mt-2 text-sm text-ink-soft">{t('teamInvite.sentTo').replace('{email}', invitation.email)}</p>

        {!user ? (
          <>
            <p className="mt-6 text-sm text-ink-soft">
              {t('teamInvite.logInWithPrefix')} <strong>{invitation.email}</strong> {t('teamInvite.toAcceptOr')}{' '}
              <a href="/signup" className="font-medium text-navy hover:text-emerald">
                {t('teamInvite.createAccount')}
              </a>{' '}
              {t('teamInvite.reopenLinkAfterward')}
            </p>
            <form onSubmit={handleLogin} className="mt-4 space-y-3 text-start">
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
                placeholder={t('auth.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              {loginError && <p className="text-sm text-redline">{loginError}</p>}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full rounded-lg bg-emerald px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {isLoggingIn ? t('auth.loggingIn') : t('auth.logInTitle')}
              </button>
            </form>
          </>
        ) : user.email !== invitation.email ? (
          <p className="mt-6 text-sm text-redline">
            {t('teamInvite.mismatchError').replace('{invited}', invitation.email).replace('{current}', user.email)}
          </p>
        ) : (
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={handleDecline}
              disabled={isActing}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-ink-soft hover:bg-gray-50"
            >
              {t('teamInvite.decline')}
            </button>
            <button
              onClick={handleAccept}
              disabled={isActing}
              className="rounded-lg bg-emerald px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isActing ? t('teamInvite.joining') : t('teamInvite.accept')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
