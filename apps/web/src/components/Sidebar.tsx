'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import type { Segment } from '@/lib/authApi';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/library', label: 'My Library' },
  { href: '/tools', label: 'Tools' },
  { href: '/settings', label: 'Settings' },
];

const SEGMENT_LABELS: Record<Segment, string> = {
  LAWYER: 'Legal Workspace',
  ACCOUNTANT: 'Accounting Workspace',
  RESEARCHER: 'Research Workspace',
};

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col bg-navy text-white">
      <Link href="/" className="px-6 py-6 font-serif text-xl font-semibold">
        brief<span className="text-emerald">.ai</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 px-3">
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

      <div className="border-t border-white/10 px-4 py-5">
        {user?.segment && (
          <Link
            href="/settings"
            className="mb-3 block truncate font-mono text-[11px] uppercase tracking-wide text-emerald hover:text-white"
          >
            {SEGMENT_LABELS[user.segment]}
          </Link>
        )}
        <p className="truncate text-xs text-[#8FA1BC]">{user?.email}</p>
        <button
          onClick={logout}
          className="mt-2 text-xs font-medium text-[#8FA1BC] hover:text-white"
        >
          Log out
        </button>
      </div>
    </aside>
  );
}
