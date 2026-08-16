import Link from 'next/link';
import { AuthProvider } from '@/lib/AuthContext';
import MarketingNav from '@/components/MarketingNav';

const PRODUCT_LINKS = [
  { label: 'Workspaces', href: '/#workspaces' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Tools', href: '/tools' },
  { label: 'Free Plan', href: '/pricing' },
];

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
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
    </AuthProvider>
  );
}
