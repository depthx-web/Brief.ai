'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { fetchInvitation, acceptInvitation, declineInvitation } from '@/lib/teamApi';
import { showError, showSuccess } from '@/lib/toast';

export default function TeamInviteAccept() {
  const inviteToken = useSearchParams().get('token');
  const { user, token, login } = useAuth();
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
        setError(err instanceof Error ? err.message : 'This invitation could not be found.');
      });
  }, [inviteToken]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'Could not log in.');
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleAccept() {
    if (!inviteToken || !token) return;
    setIsActing(true);
    try {
      await acceptInvitation(token, inviteToken);
      showSuccess('You joined the team');
      router.push('/dashboard');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not accept this invitation.');
    } finally {
      setIsActing(false);
    }
  }

  async function handleDecline() {
    if (!inviteToken) return;
    setIsActing(true);
    try {
      await declineInvitation(inviteToken);
      showSuccess('Invitation declined');
      router.push('/');
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Could not decline this invitation.');
    } finally {
      setIsActing(false);
    }
  }

  if (!inviteToken) {
    return <div className="mx-auto mt-16 max-w-md px-6 text-center text-sm text-ink-soft">No invitation token provided.</div>;
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
          Accept invitation to join {invitation.teamName}?
        </h1>
        <p className="mt-2 text-sm text-ink-soft">Sent to {invitation.email}.</p>

        {!user ? (
          <>
            <p className="mt-6 text-sm text-ink-soft">
              Log in with <strong>{invitation.email}</strong> to accept, or{' '}
              <a href="/signup" className="font-medium text-navy hover:text-emerald">
                create an account
              </a>{' '}
              and reopen this link afterward.
            </p>
            <form onSubmit={handleLogin} className="mt-4 space-y-3 text-start">
              <input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
              <input
                type="password"
                required
                placeholder="Password"
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
                {isLoggingIn ? 'Logging in…' : 'Log in'}
              </button>
            </form>
          </>
        ) : user.email !== invitation.email ? (
          <p className="mt-6 text-sm text-redline">
            This invitation was sent to {invitation.email}, but you&apos;re logged in as {user.email}.
          </p>
        ) : (
          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={handleDecline}
              disabled={isActing}
              className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-ink-soft hover:bg-gray-50"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              disabled={isActing}
              className="rounded-lg bg-emerald px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isActing ? 'Joining…' : 'Accept'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
