'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useLocale } from '@/lib/i18n/LocaleContext';
import type { DictionaryKey } from '@/lib/i18n/dictionaries/en';
import HomeLogoLink from './HomeLogoLink';
import LanguageSwitcher from './LanguageSwitcher';
import WorkspacePlanCard from './WorkspacePlanCard';

const NAV_ITEMS: { href: string; labelKey: DictionaryKey; emoji?: string }[] = [
  { href: '/dashboard', labelKey: 'sidebar.dashboard' },
  { href: '/library', labelKey: 'sidebar.myLibrary' },
  { href: '/wallet', labelKey: 'sidebar.myWallet', emoji: '👛' },
  { href: '/referrals', labelKey: 'sidebar.referrals', emoji: '🔗' },
  { href: '/tools', labelKey: 'sidebar.tools' },
  { href: '/settings', labelKey: 'sidebar.settings' },
];

export default function Sidebar({ onOpenSwitchModal }: { onOpenSwitchModal: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { t } = useLocale();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 flex h-screen w-60 shrink-0 flex-col overflow-y-auto bg-navy text-white">
      <HomeLogoLink className="px-6 py-6 font-serif text-xl font-semibold">
        brief<span className="text-emerald">.ai</span>
      </HomeLogoLink>

      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-md px-3 py-2.5 text-sm transition-colors ${
                active ? 'bg-white/10 font-medium text-white' : 'text-[#C9D4E3] hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.emoji ? `${item.emoji} ` : ''}
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
            <Link href="/login" className="mt-2 block text-xs font-medium text-emerald hover:text-white">
              {t('sidebar.logInArrow')}
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
