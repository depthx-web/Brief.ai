import { AuthProvider } from '@/lib/AuthContext';
import MarketingNav from '@/components/MarketingNav';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MarketingNav />
      <main>{children}</main>
      <footer className="bg-navy px-12 py-10 text-center text-[13px] text-[#8FA1BC]">
        <div className="mb-2.5 font-serif text-lg text-white">brief.ai</div>
        <p>© 2026 Brief.ai — All rights reserved.</p>
      </footer>
    </AuthProvider>
  );
}
