'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import Sidebar from './Sidebar';
import SwitchWorkspaceModal from './SwitchWorkspaceModal';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'workspace' | 'cycle'>('workspace');

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [isLoading, user, router]);

  if (isLoading || !user) return null;

  function openModal(step: 'workspace' | 'cycle') {
    setModalStep(step);
    setModalOpen(true);
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar onOpenSwitchModal={() => openModal('workspace')} />
      <div className="flex-1 bg-surface">
        {user.plan === 'FREE' && (
          <div className="flex items-center justify-center gap-2 bg-emerald-soft px-4 py-2 text-center text-sm text-navy">
            <span>You&apos;re on the Free plan — core tools are unlimited.</span>
            <button
              onClick={() => openModal('cycle')}
              className="font-medium text-emerald-dark hover:underline"
            >
              Upgrade for AI features →
            </button>
          </div>
        )}
        {children}
      </div>
      <SwitchWorkspaceModal open={modalOpen} initialStep={modalStep} onClose={() => setModalOpen(false)} />
    </div>
  );
}
