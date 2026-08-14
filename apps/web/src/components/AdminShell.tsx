'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '@/lib/AdminAuthContext';

const NAV_ITEMS = [
  { href: '/admin', label: 'Analytics' },
  { href: '/admin/plans', label: 'Plans & Pricing' },
  { href: '/admin/discounts', label: 'Discount codes' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/ai-providers', label: 'AI providers' },
  { href: '/admin/emails', label: 'Email campaigns' },
];

function TokenGate() {
  const { login } = useAdminAuth();
  const [tokenInput, setTokenInput] = useState('');

  return (
    <div className="mx-auto max-w-sm px-6 py-16">
      <h1 className="font-serif text-2xl font-semibold text-navy">Admin</h1>
      <p className="mt-2 text-sm text-ink-soft">Internal tools — not a customer-facing page.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          login(tokenInput);
        }}
        className="mt-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-ink">Admin token</label>
          <input
            type="password"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={!tokenInput}
          className="w-full rounded-lg bg-navy px-6 py-3 font-medium text-white transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          Enter
        </button>
      </form>
    </div>
  );
}

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { token, isReady, logout } = useAdminAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState('');

  if (!isReady) return null;
  if (!token) return <TokenGate />;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/admin/users?search=${encodeURIComponent(search.trim())}`);
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex h-screen w-[260px] shrink-0 flex-col bg-navy text-white">
        <div className="flex items-center gap-2 px-6 py-6">
          <Link href="/admin" className="font-serif text-xl font-semibold">
            brief<span className="text-emerald">.ai</span>
          </Link>
          <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wide text-[#C9D4E3]">
            Admin
          </span>
        </div>

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
          <button onClick={logout} className="text-xs font-medium text-[#8FA1BC] hover:text-white">
            Log out of admin
          </button>
        </div>
      </aside>

      <div className="flex-1 bg-surface">
        <div className="border-b border-gray-200 bg-white px-8 py-3">
          <form onSubmit={handleSearch} className="max-w-md">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users or discount codes…"
              className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            />
          </form>
        </div>
        {children}
      </div>
    </div>
  );
}
