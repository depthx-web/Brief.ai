import DesktopSidebar from './DesktopSidebar';
import type { DesktopNavKey } from '@/lib/desktopNav';

export default function DesktopShell({ active, children }: { active: DesktopNavKey; children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface">
      <DesktopSidebar active={active} />
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
