import { AuthProvider } from '@/lib/AuthContext';
import HomeLogoLink from '@/components/HomeLogoLink';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col items-center bg-surface px-6 py-16">
        <HomeLogoLink className="font-serif text-2xl font-semibold text-navy">
          dossier<span className="text-emerald">a</span>
        </HomeLogoLink>
        {children}
      </div>
    </AuthProvider>
  );
}
