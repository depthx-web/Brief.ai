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
  const requiresAccount = ACCOUNT_REQUIRED_PREFIXES.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (!isLoading && !user && requiresAccount) router.replace('/login');
  }, [isLoading, user, requiresAccount, router]);

  if (isLoading) return null;
  if (!user && requiresAccount) return null;

  // Desktop gets its own sidebar shell instead of the web dashboard's
  // Sidebar + upgrade banner — see DesktopShell/DesktopSidebar.
  if (isTauri()) {
    return <DesktopShell active={getDesktopNavKeyForPath(pathname, tabParam)}>{children}</DesktopShell>;
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar onOpenSwitchModal={() => setModalOpen(true)} />
      <div className="bg-dot-pattern ms-60 h-screen flex-1 overflow-y-auto bg-surface">
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
