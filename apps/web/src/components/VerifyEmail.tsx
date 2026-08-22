'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { verifyEmail } from '@/lib/authApi';
import { useAuth } from '@/lib/AuthContext';
import { useLocale } from '@/lib/i18n/LocaleContext';

type Status = 'pending' | 'success' | 'error';

export default function VerifyEmail() {
  const token = useSearchParams().get('token');
  const { refreshUser } = useAuth();
  const { t } = useLocale();
  const [status, setStatus] = useState<Status>('pending');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError(t('verifyEmail.noToken'));
      return;
    }
    verifyEmail(token)
      .then(() => {
        setStatus('success');
        // If the link was opened while already logged in (e.g. from the
        // Settings "Resend" flow), reflect the new verified state right away.
        refreshUser();
      })
      .catch((err) => {
        setStatus('error');
        setError(err instanceof Error ? err.message : t('verifyEmail.invalidOrExpired'));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="mx-auto mt-16 w-full max-w-md px-6">
      <div className="rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        {status === 'pending' && <p className="text-sm text-ink-soft">{t('verifyEmail.confirming')}</p>}

        {status === 'success' && (
          <>
            <h1 className="font-serif text-xl font-semibold text-navy">{t('verifyEmail.confirmed')}</h1>
            <p className="mt-2 text-sm text-ink-soft">{t('verifyEmail.verified')}</p>
            <a
              href="/dashboard"
              className="mt-6 inline-block rounded-lg bg-emerald px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-dark"
            >
              {t('nav.goToDashboard')}
            </a>
          </>
        )}

        {status === 'error' && (
          <>
            <h1 className="font-serif text-xl font-semibold text-navy">{t('verifyEmail.couldNotConfirm')}</h1>
            <p className="mt-2 text-sm text-redline">{error}</p>
            <p className="mt-4 text-sm text-ink-soft">
              {t('verifyEmail.requestNewLinkPrefix')}{' '}
              <a href="/settings" className="font-medium text-navy hover:text-emerald">
                {t('settings.title')}
              </a>
              .
            </p>
          </>
        )}
      </div>
    </div>
  );
}
