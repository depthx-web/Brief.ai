'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import HeaderAuthLinks from '@/components/HeaderAuthLinks';
import HomeLogoLink from '@/components/HomeLogoLink';
import DesktopShell from '@/components/DesktopShell';
import ToolSeoSections from '@/components/ToolSeoSections';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLocale } from '@/lib/i18n/LocaleContext';
import { stripLocalePrefix } from '@/lib/i18n/locales';
import { isTauri } from '@/lib/platform';
import { getDesktopNavKeyForPath } from '@/lib/desktopNav';
import { DashboardIcon } from '@/lib/icons';

// Individual tool pages (/protect, /merge, /word-to-pdf, ...) share this
// thin web header; on desktop they get the same sidebar shell as the rest
// of the app instead, with the sidebar item matching the tool's category.
export default function ToolsChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useLocale();

  if (isTauri()) {
    return <DesktopShell active={getDesktopNavKeyForPath(pathname)}>{children}</DesktopShell>;
  }

  return (
    <>
      <header className="border-b border-paper-line bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6 sm:py-4">
          <HomeLogoLink className="font-serif text-lg font-semibold text-navy">
            dossier<span className="text-emerald">a</span>
          </HomeLogoLink>
          <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1.5 sm:gap-6">
            <Link
              href="/dashboard"
              aria-label={t('sidebar.dashboard')}
              className="flex items-center text-navy transition-colors hover:text-emerald sm:hidden"
            >
              {DashboardIcon('currentColor')}
            </Link>
            <Link
              href="/dashboard"
              className="hidden text-sm font-medium text-navy transition-colors hover:text-emerald sm:inline"
            >
              {t('sidebar.dashboard')}
            </Link>
            <LanguageSwitcher />
            <HeaderAuthLinks />
          </div>
        </div>
      </header>
      <main>{children}</main>
      <Suspense fallback={null}>
        <ToolSeoSections slug={stripLocalePrefix(pathname).replace(/^\//, '')} />
      </Suspense>
    </>
  );
}
