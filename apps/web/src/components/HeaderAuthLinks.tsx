'use client';

import { useAuth } from '@/lib/AuthContext';
import { useLocale } from '@/lib/i18n/LocaleContext';

export default function HeaderAuthLinks() {
  const { user, isLoading, logout } = useAuth();
  const { t } = useLocale();

  if (isLoading) return null;

  if (!user) {
    return (
      <div className="flex items-center gap-3 sm:gap-4">
        <a href="/login" className="text-sm font-medium text-navy hover:text-emerald transition-colors">
          {t('nav.logIn')}
        </a>
        <a href="/signup" className="text-sm font-medium text-navy hover:text-emerald transition-colors">
          {t('nav.signUp')}
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <a href="/library" className="text-sm font-medium text-navy hover:text-emerald transition-colors">
        {t('sidebar.myLibrary')}
      </a>
      <span className="hidden text-sm text-gray-400 sm:inline">{user.email}</span>
      <button onClick={logout} className="text-sm font-medium text-navy hover:text-emerald transition-colors">
        {t('sidebar.logout')}
      </button>
    </div>
  );
}
