'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import WorkspacePlanCard from './WorkspacePlanCard';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/library', label: 'My Library' },
  { href: '/wallet', label: '👛 My Wallet' },
  { href: '/referrals', label: '🔗 Referral Program' },
  { href: '/tools', label: 'Tools' },
  { href: '/settings', label: 'Settings' },
];

export default function Sidebar({ onOpenSwitchModal }: { onOpenSwitchModal: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-10 flex h-screen w-60 shrink-0 flex-col overflow-y-auto bg-navy text-white">
      <Link href="/" className="px-6 py-6 font-serif text-xl font-semibold">
        brief<span className="text-emerald">.ai</span>
      </Link>

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
              {item.label}
            </Link>
          );
        })}
      </nav>

      <WorkspacePlanCard onSwitchClick={onOpenSwitchModal} />

      <div className="flex-1" />

      <div className="border-t border-white/10 px-4 py-5">
        {user ? (
          <>
            <p className="truncate text-xs text-[#8FA1BC]">{user.email}</p>
            <button
              onClick={logout}
              className="mt-2 text-xs font-medium text-[#8FA1BC] hover:text-white"
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <p className="text-xs text-[#8FA1BC]">Browsing as a guest</p>
            <Link href="/login" className="mt-2 block text-xs font-medium text-emerald hover:text-white">
              Log in →
            </Link>
          </>
        )}
      </div>
    </aside>
  );
}
