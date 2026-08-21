'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow, type Locale } from 'date-fns';
import { de, fr, es, it, ar } from 'date-fns/locale';
import { useAuth } from '@/lib/AuthContext';
import { listDocuments, type LibraryDocumentSummary } from '@/lib/libraryApi';
import { COUNTDOWN_BADGE_CLASS, useCountdown } from '@/lib/retentionCountdown';
import { useLocale } from '@/lib/i18n/LocaleContext';
import { FileIcon } from '@/lib/icons';

const DATE_FNS_LOCALES: Record<string, Locale> = { de, fr, es, it, ar };

// A fast, flat "what did I just touch" list — deliberately no project
// grouping, unlike the Library panel's project cards. See the Recent Panel
// section of brief-ai-desktop-design-details.md.
export default function RecentFiles() {
  const { token } = useAuth();
  const { t } = useLocale();
  const router = useRouter();
  const [docs, setDocs] = useState<LibraryDocumentSummary[] | null>(null);

  useEffect(() => {
    if (!token) {
      setDocs([]);
      return;
    }
    listDocuments(token)
      .then((list) => setDocs([...list].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))))
      .catch(() => setDocs([]));
  }, [token]);

  return (
    <div className="px-9 py-7">
      <h1 className="font-serif text-2xl font-medium text-navy">{t('sidebar.recent')}</h1>
      <div className="mt-1.5 flex items-center gap-1.5 font-mono text-xs text-ink-soft">
        <span className="h-[5px] w-[5px] rounded-full bg-emerald" />
        {t((docs?.length ?? 0) === 1 ? 'library.fileCountSingular' : 'library.fileCountPlural').replace('{n}', String(docs?.length ?? 0))}
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-paper-line bg-white">
        {docs === null && <div className="px-5 py-10 text-center text-sm text-ink-soft">{t('desktopHome.loading')}</div>}
        {docs?.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-ink-soft">
            {token ? t('recentFiles.emptyLoggedIn') : t('desktopHome.emptyLibraryGuest')}
          </div>
        )}
        {docs?.map((doc, i) => (
          <RecentFileRow
            key={doc.id}
            doc={doc}
            isLast={i === docs.length - 1}
            onOpen={() => router.push(`/workspace?doc=${doc.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

function RecentFileRow({ doc, isLast, onOpen }: { doc: LibraryDocumentSummary; isLast: boolean; onOpen: () => void }) {
  const countdown = useCountdown(doc.expiresAt);
  const { locale } = useLocale();

  return (
    <button
      onClick={onOpen}
      className={`flex w-full items-center gap-3 px-5 py-3 text-start hover:bg-surface ${isLast ? '' : 'border-b border-paper-line'}`}
    >
      <FileIcon size={16} />
      <span className="min-w-0 flex-1 truncate font-mono text-[13px] text-ink">{doc.filename}</span>
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide ${COUNTDOWN_BADGE_CLASS[countdown.urgency]}`}
      >
        {countdown.label}
      </span>
      <span className="shrink-0 font-mono text-xs text-ink-soft">
        {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true, locale: DATE_FNS_LOCALES[locale] })}
      </span>
    </button>
  );
}
