'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { showError } from '@/lib/toast';

function GoogleCompleteInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setError('Missing sign-in token.');
      return;
    }
    loginWithToken(token)
      .then(() => router.replace('/dashboard'))
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'Could not complete Google sign-in.';
        setError(message);
        showError(message);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="mx-auto mt-10 w-full max-w-sm px-6 text-center">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-level-1">
        {error ? (
          <>
            <p className="text-sm text-redline">{error}</p>
            <a href="/login" className="mt-4 inline-block text-sm font-medium text-navy hover:text-emerald">
              Back to login
            </a>
          </>
        ) : (
          <p className="text-sm text-ink-soft">Signing you in…</p>
        )}
      </div>
    </div>
  );
}

export default function GoogleCompleteHandler() {
  return (
    <Suspense fallback={<div className="mt-10 text-sm text-ink-soft">Signing you in…</div>}>
      <GoogleCompleteInner />
    </Suspense>
  );
}
