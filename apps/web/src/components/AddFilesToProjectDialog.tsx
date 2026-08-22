'use client';

import { useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuth } from '@/lib/AuthContext';
import { extractPdfText } from '@/lib/extractPdfText';
import { uploadDocument } from '@/lib/libraryApi';
import { showLoading, updateLoading, resolveLoading, failLoading } from '@/lib/toast';
import { useLocale } from '@/lib/i18n/LocaleContext';
import type { DictionaryKey } from '@/lib/i18n/dictionaries/en';

const EXTEND_OPTIONS: { days: 7 | 30; labelKey: DictionaryKey }[] = [
  { days: 7, labelKey: 'settings.retention7d' },
  { days: 30, labelKey: 'settings.retention30d' },
];

interface Props {
  open: boolean;
  projectId: string;
  category: string | null;
  // The account's configured default (Settings -> Privacy). Null/undefined
  // = platform default (1h); 0 = "Never". Drives the intro copy below.
  defaultRetentionHours?: number | null;
  onClose: () => void;
  onUploaded: () => void;
}

function defaultRetentionCopy(hours: number | null | undefined, t: (key: DictionaryKey) => string): string {
  if (hours === 0) return t('addFiles.retentionNever');
  if (hours === 24 * 30) return t('addFiles.retention30d');
  if (hours === 24 * 7) return t('addFiles.retention7d');
  return t('addFiles.retention1h');
}

// Adding files to an existing project skips the "What is this file?" step
// entirely (Part 8, Section 3) — the category is already set by the
// project itself, so only the retention choice is asked again, since every
// file added later carries its own independent clock.
export default function AddFilesToProjectDialog({ open, projectId, category, defaultRetentionHours, onClose, onUploaded }: Props) {
  const { token } = useAuth();
  const { t } = useLocale();
  const [files, setFiles] = useState<File[]>([]);
  const [extend, setExtend] = useState(false);
  const [extendDays, setExtendDays] = useState<7 | 30>(7);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFilesSelected(fileList: FileList) {
    const pdfFiles = Array.from(fileList).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    setFiles(pdfFiles);
  }

  async function handleUpload() {
    if (!token || files.length === 0) return;
    setIsUploading(true);
    const retentionDays = extend ? extendDays : undefined;
    const toastId = showLoading(
      files.length > 1
        ? t('library.uploadingOneOf').replace('{n}', String(files.length))
        : t('library.uploadingSingleFile').replace('{name}', files[0].name)
    );
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (files.length > 1) {
          updateLoading(
            toastId,
            t('library.uploadingProgress').replace('{i}', String(i + 1)).replace('{n}', String(files.length)),
            (i / files.length) * 100
          );
        }
        const pages = await extractPdfText(file);
        const fullText = pages.map((p) => p.text).join('\n\n');
        if (!fullText.trim()) continue;
        await uploadDocument(token, file, fullText, category ?? undefined, projectId, retentionDays);
      }
      resolveLoading(toastId, t(files.length === 1 ? 'addFiles.addedSingular' : 'addFiles.addedPlural').replace('{n}', String(files.length)));
      setFiles([]);
      setExtend(false);
      onUploaded();
      onClose();
    } catch (err) {
      failLoading(toastId, err instanceof Error ? err.message : t('library.couldNotUploadFiles'));
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay-dim fixed inset-0 z-50" />
        <Dialog.Content className="animate-modal-in fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-7 shadow-level-4">
          <Dialog.Title className="font-serif text-xl font-medium text-navy">{t('addFiles.title')}</Dialog.Title>

          <div
            onClick={() => inputRef.current?.click()}
            className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-8 text-center"
          >
            <p className="text-sm text-ink-soft">
              {files.length > 0
                ? t(files.length === 1 ? 'addFiles.fileSelectedSingular' : 'addFiles.fileSelectedPlural').replace('{n}', String(files.length))
                : t('addFiles.clickToChoose')}
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
            />
          </div>

          <div className="mt-4 rounded-xl bg-emerald-soft p-4">
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
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${extend ? 'bg-emerald' : 'bg-gray-300'}`}
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

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="text-sm font-medium text-ink-soft hover:text-ink">
              {t('settings.cancel')}
            </button>
            <button
              onClick={handleUpload}
              disabled={files.length === 0 || isUploading}
              className="rounded-lg bg-emerald px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isUploading ? t('dashboard.uploadingButton') : t('addFiles.upload')}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
