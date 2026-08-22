'use client';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import type { Segment } from '@/lib/authApi';
import { DOC_TYPES, docTypeLabelKey } from '@/lib/docTypes';
import { useLocale } from '@/lib/i18n/LocaleContext';
import type { DictionaryKey } from '@/lib/i18n/dictionaries/en';

const EXTEND_OPTIONS: { days: 7 | 30; labelKey: DictionaryKey }[] = [
  { days: 7, labelKey: 'settings.retention7d' },
  { days: 30, labelKey: 'settings.retention30d' },
];

interface Props {
  open: boolean;
  files: File[];
  segment: Segment | null;
  // The account's configured default (Settings -> Privacy). Null/undefined
  // = platform default (1h); 0 = "Never". Drives the intro copy below.
  defaultRetentionHours?: number | null;
  onCancel: () => void;
  onStart: (details: { name: string; category?: string; retentionDays?: number }) => void;
}

function suggestName(files: File[]): string {
  if (files.length === 0) return '';
  return files[0].name.replace(/\.pdf$/i, '');
}

function defaultRetentionCopy(hours: number | null | undefined, t: (key: DictionaryKey) => string): string {
  if (hours === 0) return t('newProjectUpload.retentionNever');
  if (hours === 24 * 30) return t('newProjectUpload.retention30d');
  if (hours === 24 * 7) return t('newProjectUpload.retention7d');
  return t('newProjectUpload.retention1h');
}

export default function NewProjectUploadDialog({ open, files, segment, defaultRetentionHours, onCancel, onStart }: Props) {
  const { t } = useLocale();
  const [step, setStep] = useState<'classify' | 'retention'>('classify');
  const [category, setCategory] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [extend, setExtend] = useState(false);
  const [extendDays, setExtendDays] = useState<7 | 30>(7);

  useEffect(() => {
    if (open) {
      setStep('classify');
      setCategory(null);
      setName('');
      setExtend(false);
      setExtendDays(7);
    }
  }, [open, files]);

  const docTypes = segment ? DOC_TYPES[segment] : [];

  function handleStartUpload() {
    onStart({
      name: name.trim() || suggestName(files),
      category: category ?? undefined,
      retentionDays: extend ? extendDays : undefined,
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay-dim fixed inset-0 z-50" />
        <Dialog.Content className="animate-modal-in fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-8 shadow-level-4">
          {step === 'classify' ? (
            <>
              <Dialog.Title className="font-serif text-2xl font-medium text-navy">{t('newProjectUpload.whatIsThisFile')}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-ink-soft">
                {files.length > 1 ? t('newProjectUpload.filesSelected').replace('{n}', String(files.length)) : files[0]?.name}
              </Dialog.Description>

              {docTypes.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {docTypes.map((type) => {
                    const selected = category === type;
                    const labelKey = docTypeLabelKey(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setCategory(selected ? null : type)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          selected
                            ? 'border-emerald bg-emerald-soft text-emerald'
                            : 'border-gray-200 bg-white text-ink-soft hover:border-gray-300'
                        }`}
                      >
                        {labelKey ? t(labelKey) : type}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-6">
                <label className="block text-sm font-medium text-ink">{t('newProjectUpload.projectName')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={suggestName(files)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button onClick={onCancel} className="text-sm font-medium text-ink-soft hover:text-ink">
                  {t('settings.cancel')}
                </button>
                <button
                  onClick={() => setStep('retention')}
                  className="rounded-lg bg-emerald px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-dark"
                >
                  {t('common.continue')}
                </button>
              </div>
            </>
          ) : (
            <>
              <Dialog.Title className="font-serif text-2xl font-medium text-navy">{t('newProjectUpload.retentionPeriod')}</Dialog.Title>

              <div className="mt-6 rounded-xl bg-emerald-soft p-4">
                <div className="flex gap-3">
                  <span aria-hidden className="text-lg">
                    ⏱
                  </span>
                  <p className="text-sm text-ink">{defaultRetentionCopy(defaultRetentionHours, t)}</p>
                </div>

                <label className="mt-4 flex items-center justify-between gap-3 border-t border-emerald/20 pt-4">
                  <span className="text-sm font-medium text-ink">{t('newProjectUpload.extendRetentionPeriod')}</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={extend}
                    onClick={() => setExtend((v) => !v)}
                    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                      extend ? 'bg-emerald' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        extend ? 'translate-x-5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </label>

                {extend && (
                  <div className="fade-in-200 mt-3 grid grid-cols-2 gap-2">
                    {EXTEND_OPTIONS.map((opt) => (
                      <button
                        key={opt.days}
                        type="button"
                        onClick={() => setExtendDays(opt.days)}
                        className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                          extendDays === opt.days
                            ? 'border-emerald bg-emerald text-white'
                            : 'border-gray-200 bg-white text-ink-soft hover:border-gray-300'
                        }`}
                      >
                        {t(opt.labelKey)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button onClick={() => setStep('classify')} className="text-sm font-medium text-ink-soft hover:text-ink">
                  {t('referral.back')}
                </button>
                <button
                  onClick={handleStartUpload}
                  className="rounded-lg bg-emerald px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-dark"
                >
                  {t('newProjectUpload.startUpload')}
                </button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
