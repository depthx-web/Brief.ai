'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { extractPdfText } from '@/lib/extractPdfText';
import { listDocuments, uploadDocument, type LibraryDocumentSummary } from '@/lib/libraryApi';
import type { Segment } from '@/lib/authApi';
import { showLoading, resolveLoading, failLoading } from '@/lib/toast';
import { DOC_TYPES, docTypeLabelKey } from '@/lib/docTypes';
import { useGreeting } from '@/lib/greeting';
import { COUNTDOWN_BADGE_CLASS, useCountdown } from '@/lib/retentionCountdown';
import { useLocale } from '@/lib/i18n/LocaleContext';
import type { DictionaryKey } from '@/lib/i18n/dictionaries/en';
import FileOptionsMenu from './FileOptionsMenu';
import ChangePlanModal from './ChangePlanModal';
import GuestSignupModal from './GuestSignupModal';

const UPLOAD_LABEL_KEY: Record<Segment, DictionaryKey> = {
  LAWYER: 'dashboard.uploadContract',
  ACCOUNTANT: 'dashboard.uploadInvoice',
  RESEARCHER: 'dashboard.uploadPaper',
};

const DROPZONE_LABEL_KEY: Record<Segment, DictionaryKey> = {
  LAWYER: 'dashboard.dropContract',
  ACCOUNTANT: 'dashboard.dropInvoice',
  RESEARCHER: 'dashboard.dropPaper',
};

const FILE_SECTION_TITLE_KEY: Record<Segment, DictionaryKey> = {
  LAWYER: 'dashboard.recentContracts',
  ACCOUNTANT: 'dashboard.recentInvoices',
  RESEARCHER: 'dashboard.recentPapers',
};

const STATUS_BADGE_KEY: Record<Segment, { textKey: DictionaryKey; className: string }> = {
  LAWYER: { textKey: 'dashboard.statusNonStandardClause', className: 'bg-amber-100 text-amber-700' },
  ACCOUNTANT: { textKey: 'dashboard.statusDataExtracted', className: 'bg-emerald-soft text-emerald' },
  RESEARCHER: { textKey: 'dashboard.statusReadyToChat', className: 'bg-emerald-soft text-emerald' },
};

export default function Dashboard() {
  const { user, token } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [recent, setRecent] = useState<LibraryDocumentSummary[]>([]);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [guestSignupOpen, setGuestSignupOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) {
      // Guests have nowhere to persist a library, so there's nothing to
      // fetch — resolve immediately instead of leaving "Loading…" stuck.
      setIsLoadingRecent(false);
      return;
    }
    listDocuments(token)
      .then((docs) => setRecent(docs.slice(0, 6)))
      .catch(() => {})
      .finally(() => setIsLoadingRecent(false));
  }, [token]);

  useEffect(() => {
    setSelectedDocType(null);
  }, [user?.segment]);

  async function handleFile(file: File) {
    if (!token) {
      setGuestSignupOpen(true);
      return;
    }
    setError(null);
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError(t('dashboard.selectPdfError'));
      return;
    }
    setIsUploading(true);
    const toastId = showLoading(t('dashboard.uploading').replace('{name}', file.name));
    try {
      const pages = await extractPdfText(file);
      const fullText = pages.map((p) => p.text).join('\n\n');
      if (!fullText.trim()) {
        const message = t('dashboard.noTextFound');
        setError(message);
        failLoading(toastId, message);
        return;
      }
      const doc = await uploadDocument(token, file, fullText, selectedDocType ?? undefined);
      resolveLoading(toastId, t('dashboard.uploadedSuccess'));
      router.push(`/workspace?doc=${doc.id}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('dashboard.uploadFailed');
      setError(message);
      failLoading(toastId, message, { onRetry: () => handleFile(file) });
    } finally {
      setIsUploading(false);
    }
  }

  const uploadLabel = user?.segment ? t(UPLOAD_LABEL_KEY[user.segment]) : t('dashboard.uploadFile');
  const dropzoneLabel = user?.segment ? t(DROPZONE_LABEL_KEY[user.segment]) : t('dashboard.dropGeneric');
  const fileSectionTitle = user?.segment ? t(FILE_SECTION_TITLE_KEY[user.segment]) : t('dashboard.recentFiles');
  const statusBadge = user?.segment
    ? { text: t(STATUS_BADGE_KEY[user.segment].textKey), className: STATUS_BADGE_KEY[user.segment].className }
    : null;
  const docTypes = user?.segment ? DOC_TYPES[user.segment] : [];
  const greeting = useGreeting();
  const firstName = user?.name?.split(' ')[0] ?? null;

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-medium text-navy">
          {greeting}{firstName ? `, ${firstName}` : ''}
        </h1>
        <button
          key={user?.segment}
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className="fade-in-200 rounded-md bg-emerald px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-dark disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {isUploading ? t('dashboard.uploadingButton') : uploadLabel}
        </button>
      </div>

      {user?.segment === 'ACCOUNTANT' && (
        <a
          href="/batch-invoices"
          className="mt-3 inline-block text-sm font-medium text-navy hover:text-emerald"
        >
          {t('dashboard.batchInvoiceCta')}
        </a>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
        }}
        className={`mt-8 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-white px-6 py-16 text-center transition-colors ${
          isDragOver ? 'border-emerald bg-emerald-soft' : 'border-navy-light/30'
        }`}
      >
        <svg
          className="mb-4 h-10 w-10 text-navy-light"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            d="M7 18a4.6 4.4 0 0 1 0-9 5 4.5 0 0 1 9.8-1.5A4.5 4.5 0 0 1 18 18H7Z"
            strokeLinejoin="round"
          />
          <path d="M12 12v6M9.5 14.5 12 12l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p key={user?.segment} className="fade-in-200 text-sm text-ink-soft">
          {isUploading ? t('dashboard.readingDocument') : dropzoneLabel}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>

      {docTypes.length > 0 && (
        <div key={user?.segment} className="fade-in-200 mt-4 flex flex-wrap gap-2">
          {docTypes.map((type) => {
            const selected = selectedDocType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedDocType(selected ? null : type)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  selected
                    ? 'border-emerald bg-emerald-soft text-emerald'
                    : 'border-gray-200 bg-white text-ink-soft hover:border-gray-300'
                }`}
              >
                {(() => {
                  const labelKey = docTypeLabelKey(type);
                  return labelKey ? t(labelKey) : type;
                })()}
              </button>
            );
          })}
        </div>
      )}

      {error && <p className="mt-4 text-sm text-redline">{error}</p>}

      <div className="mt-12">
        <h2 key={user?.segment} className="fade-in-200 mb-4 text-sm font-semibold uppercase tracking-wide text-ink-soft">
          {fileSectionTitle}
        </h2>
        {isLoadingRecent ? (
          <p className="text-sm text-ink-soft">{t('common.loading')}</p>
        ) : recent.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center">
            <p className="text-sm text-ink-soft">{t('dashboard.emptyState')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {recent.map((doc) => (
              <RecentFileCard
                key={doc.id}
                doc={doc}
                statusBadge={statusBadge}
                statusBadgeKey={user?.segment}
                onOpen={() => router.push(`/workspace?doc=${doc.id}`)}
                onRenamed={(updated) => setRecent((prev) => prev.map((d) => (d.id === updated.id ? updated : d)))}
                onDeleted={(id) => setRecent((prev) => prev.filter((d) => d.id !== id))}
                onUpgradeNeeded={() => setUpgradeModalOpen(true)}
              />
            ))}
          </div>
        )}
      </div>

      <ChangePlanModal open={upgradeModalOpen} onClose={() => setUpgradeModalOpen(false)} />
      <GuestSignupModal open={guestSignupOpen} onClose={() => setGuestSignupOpen(false)} />
    </div>
  );
}

function RecentFileCard({
  doc,
  statusBadge,
  statusBadgeKey,
  onOpen,
  onRenamed,
  onDeleted,
  onUpgradeNeeded,
}: {
  doc: LibraryDocumentSummary;
  statusBadge: { text: string; className: string } | null;
  statusBadgeKey: string | null | undefined;
  onOpen: () => void;
  onRenamed: (updated: LibraryDocumentSummary) => void;
  onDeleted: (id: string) => void;
  onUpgradeNeeded: () => void;
}) {
  const countdown = useCountdown(doc.expiresAt);
  const { locale } = useLocale();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      className="shadow-level-1 cursor-pointer rounded-lg border border-gray-200 bg-white p-4 text-start transition-colors hover:border-emerald"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="truncate font-mono text-sm text-ink">{doc.filename}</p>
        <FileOptionsMenu doc={doc} onRenamed={onRenamed} onDeleted={onDeleted} onUpgradeNeeded={onUpgradeNeeded} />
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-xs text-ink-soft">{new Date(doc.createdAt).toLocaleDateString(locale)}</span>
        <span className="flex items-center gap-1.5">
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${COUNTDOWN_BADGE_CLASS[countdown.urgency]}`}
          >
            {countdown.label}
          </span>
          {statusBadge && (
            <span
              key={statusBadgeKey}
              className={`fade-in-200 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${statusBadge.className}`}
            >
              {statusBadge.text}
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
