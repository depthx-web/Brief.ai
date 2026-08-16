'use client';

import * as Dialog from '@radix-ui/react-dialog';
import Link from 'next/link';

interface Props {
  open: boolean;
  onClose: () => void;
  toolName?: string;
}

// Shown to a logged-in user who clicks a PRO tool but has neither a paid
// plan nor a credit balance — verified client-side before they ever reach
// the tool, so the paywall shows up front instead of after they've already
// uploaded a file and run the operation only to hit a 403 from the server.
export default function UpgradePromptModal({ open, onClose, toolName }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay-dim fixed inset-0 z-50" />
        <Dialog.Content className="animate-modal-in fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-7 shadow-level-4">
          <Dialog.Title className="font-serif text-xl font-medium text-navy">Upgrade to use this tool</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-ink-soft">
            {toolName ? `${toolName} needs an active plan or a credit balance.` : 'This tool needs an active plan or a credit balance.'}
          </Dialog.Description>

          <div className="mt-6 space-y-3">
            <Link
              href="/pricing"
              className="block w-full rounded-lg bg-emerald px-6 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-emerald-dark"
            >
              View plans
            </Link>
            <Link
              href="/wallet"
              className="block w-full rounded-lg border border-gray-200 px-6 py-2.5 text-center text-sm font-medium text-navy transition-colors hover:border-gray-300"
            >
              Buy credits instead
            </Link>
          </div>

          <button onClick={onClose} className="mt-4 text-sm font-medium text-ink-soft hover:text-ink">
            Not now
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
