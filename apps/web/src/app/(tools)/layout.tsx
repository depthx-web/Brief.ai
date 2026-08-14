import Link from 'next/link';
import { AuthProvider } from '@/lib/AuthContext';
import HeaderAuthLinks from '@/components/HeaderAuthLinks';

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <header className="border-b border-paper-line bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-serif text-lg font-semibold text-navy">
            brief<span className="text-emerald">.ai</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium text-navy transition-colors hover:text-emerald">
              Dashboard
            </Link>
            <HeaderAuthLinks />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </AuthProvider>
  );
}
