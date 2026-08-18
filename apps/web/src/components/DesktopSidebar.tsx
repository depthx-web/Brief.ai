'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import type { DesktopNavKey } from '@/lib/desktopNav';

const SEGMENT_LABEL: Record<string, string> = {
  LAWYER: 'Legal',
  ACCOUNTANT: 'Accounting',
  RESEARCHER: 'Research',
};

// Real counts from ToolsIndex.tsx's TOOLS_BY_TAB — keep in sync if that
// catalog changes.
const WORKSPACE_ITEMS: { navKey: DesktopNavKey; href: string; icon: (color: string) => React.ReactNode; label: string; count?: string }[] = [
  { navKey: 'home', href: '/desktop-home', icon: HomeIcon, label: 'Home' },
  { navKey: 'convert', href: '/tools?tab=convert', icon: ConvertIcon, label: 'Convert', count: '10' },
  { navKey: 'organize', href: '/tools?tab=organize', icon: OrganizeIcon, label: 'Organize', count: '9' },
  { navKey: 'protect', href: '/tools?tab=protect', icon: ProtectIcon, label: 'Protect', count: '4' },
  { navKey: 'ai-tools', href: '/tools?tab=ai-tools', icon: AiIcon, label: 'AI Tools', count: '14' },
];

const FILE_ITEMS: { navKey: DesktopNavKey; href: string; icon: (color: string) => React.ReactNode; label: string }[] = [
  { navKey: 'library', href: '/library', icon: LibraryIcon, label: 'Library' },
  { navKey: 'recent', href: '/recent', icon: RecentIcon, label: 'Recent' },
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

const CONNECTION_COPY: Record<ConnectionState, { label: string; dot: string; body: string }> = {
  online: {
    label: 'Online',
    dot: '#1E9D75',
    body: 'Core tools always run on this device. AI features are connected.',
  },
  offline: {
    label: 'Offline',
    dot: MUTED,
    body: 'Core tools still work offline. AI features need a connection.',
  },
  reconnecting: {
    label: 'Reconnecting',
    dot: '#D4A054',
    body: 'Reconnecting to AI features… core tools are unaffected.',
  },
};

export default function DesktopSidebar({ active }: { active: DesktopNavKey }) {
  const { user, logout } = useAuth();
  const connection = useConnectionState();
  const { label, dot, body } = CONNECTION_COPY[connection];

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

      <div className="px-3.5">
        <div className="px-2 pb-2 font-mono text-[10px] font-semibold uppercase tracking-wider" style={{ color: MUTED, letterSpacing: '1px' }}>
          Workspace
        </div>
        <nav className="flex flex-col gap-0.5">
          {WORKSPACE_ITEMS.map((item) => (
            <NavRow key={item.navKey} {...item} isActive={active === item.navKey} />
          ))}
        </nav>

        <div className="mt-5 px-2 pb-2 font-mono text-[10px] font-semibold uppercase tracking-wider" style={{ color: MUTED, letterSpacing: '1px' }}>
          Files
        </div>
        <nav className="flex flex-col gap-0.5">
          {FILE_ITEMS.map((item) => (
            <NavRow key={item.navKey} {...item} isActive={active === item.navKey} />
          ))}
        </nav>
      </div>

      <div className="flex-1" />

      <div className="px-3.5">
        <div className="mb-3.5 flex items-start gap-2 rounded-[10px] bg-navy-light p-3.5">
          <span
            className="mt-1 h-2 w-2 shrink-0 rounded-full"
            style={{ background: dot, boxShadow: connection === 'online' ? '0 0 0 3px rgba(30,157,117,0.25)' : undefined }}
          />
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-wide text-white">{label}</div>
            <div className="mt-0.5 text-xs leading-normal" style={{ color: NAV_INACTIVE }}>
              {body}
            </div>
          </div>
        </div>

        {user ? (
          <div className="flex items-center gap-2.5 px-2 py-2">
            <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-emerald-soft font-mono text-[11px] font-semibold text-emerald-dark">
              {(user.name ?? user.email).slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-semibold text-white">{user.name ?? user.email}</div>
              <div className="font-mono text-[10.5px]" style={{ color: MUTED }}>
                {(user.segment && SEGMENT_LABEL[user.segment]) ?? 'No workspace'} &middot;{' '}
                {user.plan === 'PAID' ? 'Pro' : 'Free'}
              </div>
            </div>
            <button onClick={logout} className="ml-auto text-[11px] hover:text-white" style={{ color: MUTED }}>
              Log out
            </button>
          </div>
        ) : (
          <Link href="/login" className="mt-4 flex items-center gap-2.5 px-2 py-2 text-[13px] font-medium text-emerald hover:text-emerald-dark">
            Log in for AI tools &rarr;
          </Link>
        )}
      </div>
    </aside>
  );
}

function NavRow({
  href,
  icon,
  label,
  count,
  isActive,
}: {
  href: string;
  icon: (color: string) => React.ReactNode;
  label: string;
  count?: string;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg px-2.5 py-2 hover:bg-white/[0.06]"
      style={isActive ? { background: 'rgba(255,255,255,0.08)' } : undefined}
    >
      <div className="flex items-center gap-2.5">
        {icon(isActive ? '#1E9D75' : NAV_INACTIVE)}
        <span className={`text-[14px] ${isActive ? 'font-semibold text-white' : ''}`} style={isActive ? undefined : { color: NAV_INACTIVE }}>
          {label}
        </span>
      </div>
      {count && (
        <span className="font-mono text-xs" style={{ color: MUTED }}>
          {count}
        </span>
      )}
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
function ConvertIcon(color: string) {
  return (
    <svg {...iconProps(color)}>
      <path d="M7 7h10M7 7l3-3M7 7l3 3" />
      <path d="M17 17H7M17 17l-3-3M17 17l-3 3" />
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
function ProtectIcon(color: string) {
  return (
    <svg {...iconProps(color)}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    </svg>
  );
}
function AiIcon(color: string) {
  return (
    <svg {...iconProps(color)}>
      <path d="M12 3l1.8 5.5L19 10l-5.2 1.5L12 17l-1.8-5.5L5 10l5.2-1.5L12 3z" />
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
