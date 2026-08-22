'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useLocale } from '@/lib/i18n/LocaleContext';
import { isTauri } from '@/lib/platform';
import { getDesktopNavKeyForPath } from '@/lib/desktopNav';
import Sidebar from './Sidebar';
import DesktopShell from './DesktopShell';
import ChangePlanModal from './ChangePlanModal';
import GuestSignupModal from './GuestSignupModal';

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

// Free users can use the dashboard, tools, and workspace without an
// account — only pages tied to a persistent account (saved library,
// credit wallet, billing/security settings, referral earnings) require
// login. Everything else stays open so a guest never hits a forced
// signup wall before they've even seen the product.
const ACCOUNT_REQUIRED_PREFIXES = ['/library', '/wallet', '/settings', '/referrals', '/recent'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AppShellInner>{children}</AppShellInner>
    </Suspense>
  );
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  // Only read for /tools's sidebar-highlight purposes — see getDesktopNavKeyForPath.
  const tabParam = useSearchParams().get('tab');
  const [modalOpen, setModalOpen] = useState(false);
  const [guestSignupOpen, setGuestSignupOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const requiresAccount = ACCOUNT_REQUIRED_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!isLoading && !user && requiresAccount) router.replace('/login');
  }, [isLoading, user, requiresAccount, router]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  if (isLoading) return null;
  if (!user && requiresAccount) return null;

  // Desktop gets its own sidebar shell instead of the web dashboard's
  // Sidebar + upgrade banner — see DesktopShell/DesktopSidebar.
  if (isTauri()) {
    return <DesktopShell active={getDesktopNavKeyForPath(pathname, tabParam)}>{children}</DesktopShell>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar
        onOpenSwitchModal={() => setModalOpen(true)}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />
      <div className="bg-dot-pattern h-screen flex-1 overflow-y-auto bg-surface md:ms-60">
        <div className="flex items-center gap-3 border-b border-paper-line bg-white px-4 py-3 md:hidden">
          <button
            onClick={() => setMobileNavOpen(true)}
            aria-label={t('sidebar.openMenu')}
            className="text-navy"
          >
            <MenuIcon />
          </button>
          <span className="font-serif text-lg font-semibold text-navy">
            dossier<span className="text-emerald">a</span>
          </span>
        </div>
        {(!user || user.plan === 'FREE') && (
          <div className="flex items-center justify-center gap-2 bg-emerald-soft px-4 py-2 text-center text-sm text-navy">
            <span>{t('appShell.freePlanBanner')}</span>
            <button
              onClick={() => (user ? setModalOpen(true) : setGuestSignupOpen(true))}
              className="font-medium text-emerald-dark hover:underline"
            >
              {t('appShell.upgradeForAiFeatures')}
            </button>
          </div>
        )}
        {children}
      </div>
      <ChangePlanModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <GuestSignupModal open={guestSignupOpen} onClose={() => setGuestSignupOpen(false)} />
    </div>
  );
}
