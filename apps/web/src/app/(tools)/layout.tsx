import { AuthProvider } from '@/lib/AuthContext';
import ToolsChrome from '@/components/ToolsChrome';

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ToolsChrome>{children}</ToolsChrome>
    </AuthProvider>
  );
}
