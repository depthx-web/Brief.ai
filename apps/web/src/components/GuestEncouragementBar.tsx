'use client';

import { useAuth } from '@/lib/AuthContext';
import { useLocale } from '@/lib/i18n/LocaleContext';

// Shown below the download button after a successful free-tool operation
// (Batch 4, Section 3) — calm, not a popup, and only for guests since a
// signed-in user already has everything it's offering.
export default function GuestEncouragementBar() {
  const { user } = useAuth();
  const { t } = useLocale();
  if (user) return null;

  return (
    <div className="fade-in-200 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-emerald-soft px-4 py-3">
      <p className="text-sm text-ink">{t('guestBar.createAccountToSave')}</p>
      <a href="/signup" className="text-sm font-semibold text-emerald-dark hover:underline">
        {t('guestBar.signUpFree')}
      </a>
    </div>
  );
}
