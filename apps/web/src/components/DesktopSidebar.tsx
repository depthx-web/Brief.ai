'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useLocale } from '@/lib/i18n/LocaleContext';
import type { DictionaryKey } from '@/lib/i18n/dictionaries/en';
import { getCreditBalance } from '@/lib/creditsApi';
import type { DesktopNavKey } from '@/lib/desktopNav';
import type { Segment } from '@/lib/authApi';
import { TOOLS_BY_TAB, type Tab } from './ToolsIndex';
import { ConvertIcon, ProtectIcon, AiIcon } from '@/lib/icons';
import LoginModal from './LoginModal';
import LanguageSwitcher from './LanguageSwitcher';

const SEGMENT_LABEL_KEY: Record<string, DictionaryKey> = {
  LAWYER: 'segment.legal',
  ACCOUNTANT: 'segment.accounting',
  RESEARCHER: 'segment.research',
};

const TOOLS_EXPANDED_KEY = 'brief-ai-desktop-tools-expanded';

const HOME_ITEM: { navKey: DesktopNavKey; href: string; icon: (color: string) => React.ReactNode; labelKey: DictionaryKey } = {
  navKey: 'home',
  href: '/desktop-home',
  icon: HomeIcon,
  labelKey: 'sidebar.home',
};

const TOOL_SUB_ITEMS: { navKey: DesktopNavKey; href: string; icon: (color: string) => React.ReactNode; labelKey: DictionaryKey; tab: Tab }[] = [
  { navKey: 'convert', href: '/tools?tab=convert', icon: ConvertIcon, labelKey: 'sidebar.convert', tab: 'Convert' },
  { navKey: 'organize', href: '/tools?tab=organize', icon: OrganizeIcon, labelKey: 'sidebar.organize', tab: 'Organize' },
  { navKey: 'protect', href: '/tools?tab=protect', icon: ProtectIcon, labelKey: 'sidebar.protect', tab: 'Protect' },
  { navKey: 'ai-tools', href: '/tools?tab=ai-tools', icon: AiIcon, labelKey: 'sidebar.aiTools', tab: 'AI tools' },
];

// Live count for the currently active workspace, not a global total — a
// Researcher only has 4 relevant AI tools, not the full catalog's 14, and
// this must react to a tool being toggled Free/PRO or per-workspace since
// it reads the same TOOLS_BY_TAB/segment filter the /tools page itself uses.
function countForTab(tab: Tab, segment: Segment | null): number {
  return TOOLS_BY_TAB[tab].filter((tool) => !tool.segments || !segment || tool.segments.includes(segment)).length;
}

// requiresAuth: AppShell redirects an unauthenticated visit to these routes
// to the plain web /login route (no desktop chrome at all) — clicking here
// while logged out instead opens LoginModal, the same as the profile
// block's "Log in for AI tools" button, so a logged-out desktop user never
// lands on the unshelled page.
const FILE_ITEMS: { navKey: DesktopNavKey; href: string; icon: (color: string) => React.ReactNode; labelKey: DictionaryKey; requiresAuth?: boolean }[] = [
  { navKey: 'library', href: '/library', icon: LibraryIcon, labelKey: 'sidebar.library', requiresAuth: true },
  { navKey: 'recent', href: '/recent', icon: RecentIcon, labelKey: 'sidebar.recent', requiresAuth: true },
];

// Account-level pages — separate from workspace tools and file management.
const ACCOUNT_ITEMS: { navKey: DesktopNavKey; href: string; icon: (color: string) => React.ReactNode; labelKey: DictionaryKey; requiresAuth?: boolean }[] = [
  { navKey: 'wallet', href: '/wallet', icon: WalletIcon, labelKey: 'sidebar.wallet', requiresAuth: true },
  { navKey: 'referrals', href: '/referrals', icon: ReferralIcon, labelKey: 'sidebar.referrals', requiresAuth: true },
  { navKey: 'settings', href: '/settings', icon: SettingsIcon, labelKey: 'sidebar.settings', requiresAuth: true },
];

// Muted navy-gray for secondary text on the dark sidebar — not the same as
// --ink-soft, which assumes a light background.
const MUTED = '#6B7A99';
const NAV_INACTIVE = '#C9D4E3';

type ConnectionState = 'online' | 'offline' | 'reconnecting';

function useConnectionState(): ConnectionState {
  const [state, setState] = useState<ConnectionState>('online');

  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    setState(navigator.onLine ? 'online' : 'offline');

    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    const goOffline = () => setState('offline');
    const goOnline = () => {
      setState('reconnecting');
      reconnectTimer = setTimeout(() => setState('online'), 1200);
    };

    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  return state;
}

const CONNECTION_COPY: Record<ConnectionState, { labelKey: DictionaryKey; dot: string; bodyKey: DictionaryKey }> = {
  online: { labelKey: 'desktop.online', dot: '#1E9D75', bodyKey: 'desktop.onlineBody' },
  offline: { labelKey: 'desktop.offline', dot: MUTED, bodyKey: 'desktop.offlineBody' },
  reconnecting: { labelKey: 'desktop.reconnecting', dot: '#D4A054', bodyKey: 'desktop.reconnectingBody' },
};

export default function DesktopSidebar({ active }: { active: DesktopNavKey }) {
  const { user, token, logout } = useAuth();
  const { t } = useLocale();
  const connection = useConnectionState();
  const { labelKey, dot, bodyKey } = CONNECTION_COPY[connection];
  const [balance, setBalance] = useState<number | null>(null);
  const [loginOpen, setLoginOpen] = useState(false);
  // Collapsed by default; a stored preference (if any) overrides this after
  // mount — read in an effect, not the initializer, to avoid an SSR/client
  // hydration mismatch on first paint.
  const [toolsExpanded, setToolsExpanded] = useState(false);

  useEffect(() => {
    if (!token) {
      setBalance(null);
      return;
    }
    getCreditBalance(token).then(setBalance).catch(() => {});
  }, [token]);

  useEffect(() => {
    const stored = localStorage.getItem(TOOLS_EXPANDED_KEY);
    if (stored !== null) setToolsExpanded(stored === 'true');
  }, []);

  function toggleTools() {
    setToolsExpanded((prev) => {
      const next = !prev;
      localStorage.setItem(TOOLS_EXPANDED_KEY, String(next));
      return next;
    });
  }

  const segment = user?.segment ?? null;
  const anyToolActive = TOOL_SUB_ITEMS.some((item) => item.navKey === active);
  const toolsSectionOpen = toolsExpanded || anyToolActive;

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-navy py-[22px] text-white">
      <Link href="/desktop-home" className="block px-5 pb-[22px]">
        <div className="font-serif text-[18px] font-semibold tracking-tight">
          brief<span className="text-emerald">.ai</span>
        </div>
        <div className="mt-1 font-mono text-[10px] tracking-wide" style={{ color: MUTED }}>
          v1.0 &middot; desktop
        </div>
      </Link>

      <div className="min-h-0 flex-1 overflow-y-auto px-3.5">
        <div className="px-2 pb-2 font-mono text-[10px] font-semibold uppercase tracking-wider" style={{ color: MUTED, letterSpacing: '1px' }}>
          {t('desktop.workspace')}
        </div>
        <nav className="flex flex-col gap-0.5">
          <NavRow {...HOME_ITEM} isActive={active === HOME_ITEM.navKey} />
          <button
            onClick={toggleTools}
            className="flex items-center justify-between rounded-lg px-2.5 py-2 hover:bg-white/[0.06]"
            style={anyToolActive ? { background: 'rgba(255,255,255,0.08)' } : undefined}
            aria-expanded={toolsSectionOpen}
          >
            <div className="flex items-center gap-2.5">
              {ToolsGroupIcon(anyToolActive ? '#1E9D75' : NAV_INACTIVE)}
              <span
                className={`text-[14px] ${anyToolActive ? 'font-semibold text-white' : ''}`}
                style={anyToolActive ? undefined : { color: NAV_INACTIVE }}
              >
                {t('sidebar.tools')}
              </span>
            </div>
            <ChevronIcon color={MUTED} expanded={toolsSectionOpen} />
          </button>
          {toolsSectionOpen && (
            <div className="flex flex-col gap-0.5 pl-4">
              {TOOL_SUB_ITEMS.map((item) => (
                <NavRow
                  key={item.navKey}
                  href={item.href}
                  icon={item.icon}
                  labelKey={item.labelKey}
                  count={String(countForTab(item.tab, segment))}
                  isActive={active === item.navKey}
                />
              ))}
            </div>
          )}
        </nav>

        <div className="mt-5 px-2 pb-2 font-mono text-[10px] font-semibold uppercase tracking-wider" style={{ color: MUTED, letterSpacing: '1px' }}>
          {t('desktop.files')}
        </div>
        <nav className="flex flex-col gap-0.5">
          {FILE_ITEMS.map((item) => (
            <NavRow
              key={item.navKey}
              {...item}
              isActive={active === item.navKey}
              isLoggedIn={!!user}
              onRequireLogin={() => setLoginOpen(true)}
            />
          ))}
        </nav>

        <div className="mt-5 px-2 pb-2 font-mono text-[10px] font-semibold uppercase tracking-wider" style={{ color: MUTED, letterSpacing: '1px' }}>
          {t('desktop.account')}
        </div>
        <nav className="flex flex-col gap-0.5">
          {ACCOUNT_ITEMS.map((item) => (
            <NavRow
              key={item.navKey}
              {...item}
              isActive={active === item.navKey}
              isLoggedIn={!!user}
              onRequireLogin={() => setLoginOpen(true)}
            />
          ))}
        </nav>
      </div>

      <div className="px-3.5 pt-3">
        <div className="mb-3.5 flex items-start gap-2 rounded-[10px] bg-navy-light p-3.5">
          <span
            className="mt-1 h-2 w-2 shrink-0 rounded-full"
            style={{ background: dot, boxShadow: connection === 'online' ? '0 0 0 3px rgba(30,157,117,0.25)' : undefined }}
          />
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-wide text-white">{t(labelKey)}</div>
            <div className="mt-0.5 text-xs leading-normal" style={{ color: NAV_INACTIVE }}>
              {t(bodyKey)}
            </div>
          </div>
        </div>

        {balance !== null && (
          <Link href="/wallet" className="mb-2 flex items-center gap-1.5 px-2 font-mono text-[10px] hover:text-white" style={{ color: MUTED }}>
            {WalletIcon(MUTED)}
            {balance} credit{balance === 1 ? '' : 's'}
          </Link>
        )}

        <div className="mb-1 px-2">
          <LanguageSwitcher variant="dark" />
        </div>

        {user ? (
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-emerald-soft font-mono text-[11px] font-semibold text-emerald-dark">
              {(user.name ?? user.email).slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-semibold text-white">{user.name ?? user.email}</div>
              <div className="font-mono text-[10.5px]" style={{ color: MUTED }}>
                {(user.segment && t(SEGMENT_LABEL_KEY[user.segment])) ?? t('desktop.noWorkspace')} &middot;{' '}
                {user.plan === 'PAID' ? t('desktop.pro') : t('desktop.free')}
              </div>
            </div>
            <button onClick={logout} className="text-[11px] hover:text-white" style={{ color: MUTED }}>
              {t('sidebar.logout')}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setLoginOpen(true)}
            className="flex w-full items-center gap-2.5 px-2 py-2 text-left text-[13px] font-medium text-emerald hover:text-emerald-dark"
          >
            {t('desktop.logInForAiTools')}
          </button>
        )}
      </div>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </aside>
  );
}

function NavRow({
  href,
  icon,
  labelKey,
  count,
  isActive,
  requiresAuth,
  isLoggedIn,
  onRequireLogin,
}: {
  href: string;
  icon: (color: string) => React.ReactNode;
  labelKey: DictionaryKey;
  count?: string;
  isActive: boolean;
  requiresAuth?: boolean;
  isLoggedIn?: boolean;
  onRequireLogin?: () => void;
}) {
  const { t } = useLocale();
  const content = (
    <>
      <div className="flex items-center gap-2.5">
        {icon(isActive ? '#1E9D75' : NAV_INACTIVE)}
        <span className={`text-[14px] ${isActive ? 'font-semibold text-white' : ''}`} style={isActive ? undefined : { color: NAV_INACTIVE }}>
          {t(labelKey)}
        </span>
      </div>
      {count && (
        <span className="font-mono text-xs" style={{ color: MUTED }}>
          {count}
        </span>
      )}
    </>
  );

  if (requiresAuth && !isLoggedIn) {
    return (
      <button
        onClick={onRequireLogin}
        className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left hover:bg-white/[0.06]"
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg px-2.5 py-2 hover:bg-white/[0.06]"
      style={isActive ? { background: 'rgba(255,255,255,0.08)' } : undefined}
    >
      {content}
    </Link>
  );
}

// Stroke-based icons on a 24px viewBox, matching weight/style across the set.
const iconProps = (color: string) => ({
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: color,
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

function HomeIcon(color: string) {
  return (
    <svg {...iconProps(color)}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />
    </svg>
  );
}
function OrganizeIcon(color: string) {
  return (
    <svg {...iconProps(color)}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </svg>
  );
}
function ToolsGroupIcon(color: string) {
  return (
    <svg {...iconProps(color)}>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <path d="M13 17.5l2 2 4.5-4.5" />
      <path d="M4 17.5l2 2 4.5-4.5" />
    </svg>
  );
}
function ChevronIcon({ color, expanded }: { color: string; expanded: boolean }) {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="transition-transform duration-150"
      style={{ transform: expanded ? 'rotate(90deg)' : undefined }}
    >
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
function LibraryIcon(color: string) {
  return (
    <svg {...iconProps(color)}>
      <path d="M4 6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6z" />
    </svg>
  );
}
function RecentIcon(color: string) {
  return (
    <svg {...iconProps(color)}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </svg>
  );
}
function WalletIcon(color: string) {
  return (
    <svg {...iconProps(color)}>
      <path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
      <path d="M16 12h3v3h-3a1.5 1.5 0 0 1 0-3z" />
    </svg>
  );
}
function ReferralIcon(color: string) {
  return (
    <svg {...iconProps(color)}>
      <circle cx="7" cy="7" r="3" />
      <circle cx="17" cy="17" r="3" />
      <path d="M9.5 9.5l5 5" />
    </svg>
  );
}
function SettingsIcon(color: string) {
  return (
    <svg {...iconProps(color)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}
