'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { useLocale } from '@/lib/i18n/LocaleContext';
import HomeLogoLink from './HomeLogoLink';
import LanguageSwitcher from './LanguageSwitcher';

export default function MarketingNav() {
  const { user } = useAuth();
  const { t } = useLocale();

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between bg-navy/95 px-6 py-5 text-white backdrop-blur-md sm:px-12">
      <HomeLogoLink className="font-serif text-2xl font-semibold tracking-tight">
        brief<span className="text-emerald">.ai</span>
      </HomeLogoLink>
      <div className="hidden gap-9 text-sm text-[#C9D4E3] sm:flex">
        <a href="/#workspaces" className="transition-colors hover:text-white">
          {t('nav.workspaces')}
        </a>
        <a href="/#trust" className="transition-colors hover:text-white">
          {t('nav.privacy')}
        </a>
        <Link href="/pricing" className="transition-colors hover:text-white">
          {t('nav.pricing')}
        </Link>
        <a href="/#desktop-app" className="transition-colors hover:text-white">
          {t('nav.desktopApp')}
        </a>
      </div>
      <div className="flex items-center gap-3">
        <LanguageSwitcher variant="dark" />
        {user ? (
          <Link
            href="/dashboard"
            className="rounded-md bg-emerald px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(30,157,117,0.35)]"
          >
            {t('nav.goToDashboard')}
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-[#C9D4E3] transition-colors hover:text-white">
              {t('nav.logIn')}
            </Link>
            <Link
              href="/signup"
              className="rounded-md bg-emerald px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(30,157,117,0.35)]"
            >
              {t('nav.signUp')}
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
