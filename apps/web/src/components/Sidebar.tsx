'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useLocale } from '@/lib/i18n/LocaleContext';
import { stripLocalePrefix } from '@/lib/i18n/locales';
import type { DictionaryKey } from '@/lib/i18n/dictionaries/en';
import HomeLogoLink from './HomeLogoLink';
import LanguageSwitcher from './LanguageSwitcher';
import WorkspacePlanCard from './WorkspacePlanCard';
import { DashboardIcon, LibraryIcon, WalletIcon, ReferralIcon, ToolsGroupIcon, SettingsIcon, CloseIcon } from '@/lib/icons';

const NAV_ITEMS: { href: string; labelKey: DictionaryKey; icon: (color: string) => React.ReactNode }[] = [
  { href: '/dashboard', labelKey: 'sidebar.dashboard', icon: DashboardIcon },
  { href: '/library', labelKey: 'sidebar.myLibrary', icon: LibraryIcon },
  { href: '/wallet', labelKey: 'sidebar.myWallet', icon: WalletIcon },
  { href: '/referrals', labelKey: 'sidebar.referrals', icon: ReferralIcon },
  { href: '/tools', labelKey: 'sidebar.tools', icon: ToolsGroupIcon },
  { href: '/settings', labelKey: 'sidebar.settings', icon: SettingsIcon },
];

const NAV_INACTIVE = '#C9D4E3';

interface Props {
  onOpenSwitchModal: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ onOpenSwitchModal, mobileOpen = false, onMobileClose }: Props) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLocale();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onMobileClose}
          aria-hidden
        />
      )}
      <aside
        className={`fixed inset-y-0 start-0 z-40 h-screen w-60 shrink-0 flex-col overflow-y-auto bg-navy text-white md:flex ${
          mobileOpen ? 'flex' : 'hidden'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <HomeLogoLink className="font-serif text-xl font-semibold">
            dossier<span className="text-emerald">a</span>
          </HomeLogoLink>
          <button
            onClick={onMobileClose}
            aria-label={t('sidebar.closeMenu')}
            className="text-[#C9D4E3] hover:text-white md:hidden"
          >
            <CloseIcon size={18} />
          </button>
        </div>

      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = stripLocalePrefix(pathname) === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2.5 text-sm transition-colors ${
                active ? 'bg-white/10 font-medium text-white' : 'text-[#C9D4E3] hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.icon(active ? '#1E9D75' : NAV_INACTIVE)}
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      <WorkspacePlanCard onSwitchClick={onOpenSwitchModal} />

      <div className="flex-1" />

      <div className="border-t border-white/10 px-4 py-3">
        <LanguageSwitcher variant="dark" />
      </div>

      <div className="border-t border-white/10 px-4 py-5">
        {user ? (
          <>
            <p className="truncate text-xs text-[#8FA1BC]">{user.email}</p>
            <button
              onClick={logout}
              className="mt-2 text-xs font-medium text-[#8FA1BC] hover:text-white"
            >
              {t('sidebar.logout')}
            </button>
          </>
        ) : (
          <>
            <p className="text-xs text-[#8FA1BC]">{t('sidebar.browsingAsGuest')}</p>
            <Link href="/login" onClick={onMobileClose} className="mt-2 block text-xs font-medium text-emerald hover:text-white">
              {t('sidebar.logInArrow')}
            </Link>
          </>
        )}
      </div>
      </aside>
    </>
  );
}
