import Link from 'next/link';
import { AuthProvider } from '@/lib/AuthContext';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col items-center bg-surface px-6 py-16">
        <Link href="/" className="font-serif text-2xl font-semibold text-navy">
          brief<span className="text-emerald">.ai</span>
        </Link>
        {children}
      </div>
    </AuthProvider>
  );
}
