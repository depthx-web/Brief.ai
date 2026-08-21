'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useLocale } from '@/lib/i18n/LocaleContext';

export default function RetentionConfirmDialog({
  days,
  onCancel,
  onConfirm,
}: {
  days: 7 | 30 | null;
  onCancel: () => void;
  onConfirm: (days: 7 | 30) => void;
}) {
  const { t } = useLocale();

  return (
    <Dialog.Root open={days !== null} onOpenChange={(next) => !next && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay-dim fixed inset-0 z-50" />
        <Dialog.Content className="animate-modal-in fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-level-4">
          <Dialog.Title className="font-serif text-lg font-semibold text-navy">{t('retentionConfirm.title')}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-ink-soft">
            {days !== null && t('retentionConfirm.body').replace('{days}', String(days))}
          </Dialog.Description>
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={onCancel} className="text-sm font-medium text-ink-soft hover:text-ink">
              {t('settings.cancel')}
            </button>
            <button
              onClick={() => days !== null && onConfirm(days)}
              className="rounded-lg bg-emerald px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-dark"
            >
              {t('retentionConfirm.confirm')}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
