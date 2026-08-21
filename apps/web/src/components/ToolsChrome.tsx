'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import HeaderAuthLinks from '@/components/HeaderAuthLinks';
import HomeLogoLink from '@/components/HomeLogoLink';
import DesktopShell from '@/components/DesktopShell';
import ToolSeoSections from '@/components/ToolSeoSections';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLocale } from '@/lib/i18n/LocaleContext';
import { isTauri } from '@/lib/platform';
import { getDesktopNavKeyForPath } from '@/lib/desktopNav';

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
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <HomeLogoLink className="font-serif text-lg font-semibold text-navy">
            brief<span className="text-emerald">.ai</span>
          </HomeLogoLink>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-navy transition-colors hover:text-emerald">
              {t('sidebar.dashboard')}
            </Link>
            <LanguageSwitcher />
            <HeaderAuthLinks />
          </div>
        </div>
      </header>
      <main>{children}</main>
      <ToolSeoSections slug={pathname.replace(/^\//, '')} />
    </>
  );
}
