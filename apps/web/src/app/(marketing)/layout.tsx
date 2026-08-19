import { AuthProvider } from '@/lib/AuthContext';
import MarketingChrome from '@/components/MarketingChrome';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MarketingChrome>{children}</MarketingChrome>
    </AuthProvider>
  );
}
