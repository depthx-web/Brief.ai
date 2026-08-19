'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import MarketingNav from './MarketingNav';
import DesktopShell from './DesktopShell';
import { isTauri } from '@/lib/platform';
import { getDesktopNavKeyForPath } from '@/lib/desktopNav';

const PRODUCT_LINKS = [
  { label: 'Workspaces', href: '/#workspaces' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Tools', href: '/tools' },
  { label: 'Free Plan', href: '/pricing' },
  { label: 'Desktop App', href: '/#desktop-app' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

// Pricing (and, incidentally, Privacy/Terms/Download if a desktop user ever
// lands there) share this route group's layout with the public marketing
// site. On desktop that meant "opening Pricing" silently swapped the
// persistent sidebar shell for the web's navbar+footer — exactly the "app
// shell, not web page" gap this doc calls out. Desktop keeps the shell
// visible here instead, same as every other panel.
export default function MarketingChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isTauri()) {
    return <DesktopShell active={getDesktopNavKeyForPath(pathname)}>{children}</DesktopShell>;
  }

  return (
    <>
      <MarketingNav />
      <main>{children}</main>
      <footer className="bg-navy px-6 py-14 text-white sm:px-12">
        <div className="mx-auto grid max-w-6xl gap-10 sm:grid-cols-3">
          <div>
            <div className="mb-3 font-serif text-lg text-white">brief.ai</div>
            <p className="max-w-[26ch] text-[13px] leading-relaxed text-[#8FA1BC]">
              AI-powered PDF tools for legal, accounting, and research professionals.
            </p>
          </div>
          <div>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-wide text-emerald">Product</p>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[13px] text-[#8FA1BC] transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-wide text-emerald">Legal</p>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[13px] text-[#8FA1BC] transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-center text-[13px] text-[#8FA1BC]">
          © 2026 Brief.ai — All rights reserved.
        </div>
      </footer>
    </>
  );
}
