import { AdminAuthProvider } from '@/lib/AdminAuthContext';
import AdminShell from '@/components/AdminShell';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminShell>{children}</AdminShell>
    </AdminAuthProvider>
  );
}
