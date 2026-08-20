'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/lib/AuthContext';
import { fetchCmsPage } from '@/lib/cmsApi';
import { listDocuments, type LibraryDocumentSummary } from '@/lib/libraryApi';
import { useGreeting } from '@/lib/greeting';
import { COUNTDOWN_BADGE_CLASS, useCountdown } from '@/lib/retentionCountdown';
import DesktopSidebar from './DesktopSidebar';
import ActivityBall from './ActivityBall';

interface Announcement {
  badge: string;
  kicker: string;
  headline: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
}

// Shown until the admin publishes something at /admin/content → "Desktop
// App — Home" — matches what the migration seeds, so first boot and an
// unpublished page look identical rather than the card flashing empty.
const DEFAULT_ANNOUNCEMENT: Announcement = {
  badge: 'New',
  kicker: 'Product update',
  headline: 'AI Contract Compare is here',
  body: 'Redline two versions of any contract side-by-side and get every change explained in plain English — included with every Legal workspace.',
  ctaLabel: 'See what’s new',
  ctaHref: '/contract-compare',
};

// One announcement section per workspace segment (announcement_lawyer /
// _accountant / _researcher), each independently editable at
// /admin/content → "Desktop App — Home" — see the segment_desktop_home_
// announcement migration.
const SEGMENT_TO_ANNOUNCEMENT_KEY: Record<string, string> = {
  LAWYER: 'lawyer',
  ACCOUNTANT: 'accountant',
  RESEARCHER: 'researcher',
};

// Real counts from ToolsIndex.tsx's TOOLS_BY_TAB, not placeholders — keep
// these in sync if that catalog changes. AI count is Lawyer-segment sized
// to match the profile card below; swap per effectiveSegment if this needs
// to generalize beyond the single logged-in-Legal-user case.
const QUICK_ACCESS = [
  {
    href: '/tools?tab=convert',
    name: 'Convert',
    description: 'Office ↔ PDF, images, HTML and plain text — all in one place.',
    count: '10 tools · runs on this device',
    local: true,
  },
  {
    href: '/tools?tab=organize',
    name: 'Organize & Protect',
    description: 'Merge, split, reorder, compress, password-protect and watermark.',
    count: '13 tools · runs on this device',
    local: true,
  },
  {
    href: '/tools?tab=ai-tools',
    name: 'AI Tools',
    description: 'Clause analysis, chat, comparisons and summaries for your field.',
    count: '14 tools · needs internet',
    local: false,
  },
];

export default function DesktopHome() {
  return (
    <Suspense fallback={null}>
      <DesktopHomeInner />
    </Suspense>
  );
}

function DesktopHomeInner() {
  const { user, token } = useAuth();
  // Lets the admin's "Site Content" live-preview iframe (which loads
  // /desktop-home?cmsPreview=1) show unpublished draft edits — everywhere
  // else this is absent, so it falls through to published content.
  const searchParams = useSearchParams();
  const preview = searchParams.get('cmsPreview') === '1';
  // The admin preview iframe passes this so the pane shows whichever
  // segment's accordion section is actually open, regardless of the
  // logged-in admin's own workspace — see AdminCms.tsx.
  const previewSegment = searchParams.get('previewSegment');
  const [announcement, setAnnouncement] = useState<Announcement>(DEFAULT_ANNOUNCEMENT);
  const [dismissed, setDismissed] = useState(false);
  const [recentFiles, setRecentFiles] = useState<LibraryDocumentSummary[] | null>(null);

  // Guests and users who haven't picked a workspace yet get the Legal
  // variant — same default the section had before this was per-segment.
  const effectiveSegmentKey = previewSegment ?? (user?.segment ? SEGMENT_TO_ANNOUNCEMENT_KEY[user.segment] : null) ?? 'lawyer';
  const announcementKey = `announcement_${effectiveSegmentKey}`;

  useEffect(() => {
    fetchCmsPage('desktop-home', preview).then((page) => {
      const fields = page?.sections[announcementKey] as Partial<Announcement> | undefined;
      if (fields?.headline) setAnnouncement({ ...DEFAULT_ANNOUNCEMENT, ...fields });
    });
  }, [preview, announcementKey]);

  useEffect(() => {
    if (!token) {
      setRecentFiles([]);
      return;
    }
    listDocuments(token)
      .then((docs) => setRecentFiles(docs.slice(0, 5)))
      .catch(() => setRecentFiles([]));
  }, [token]);

  const firstName = user?.name?.split(' ')[0] ?? null;
  const greeting = useGreeting();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-surface">
      <DesktopSidebar active="home" />

      {/* MAIN */}
      <main className="min-w-0 flex-1 overflow-y-auto px-9 py-7">
        <div className="mb-[22px] flex items-baseline justify-between">
          <h1 className="font-serif text-[26px] font-medium text-navy">
            {greeting}{firstName ? `, ${firstName}` : ''}
          </h1>
          <span className="text-[12.5px] text-ink-soft">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>

        {!dismissed && (
          <div className="relative overflow-hidden rounded-[14px] bg-gradient-to-br from-navy to-navy-light px-8 py-[26px] shadow-level-3">
            <div className="pointer-events-none absolute -right-[60px] -top-20 h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(30,157,117,0.16)_0%,rgba(30,157,117,0)_70%)]" />
            <button
              onClick={() => setDismissed(true)}
              aria-label="Dismiss"
              className="absolute right-5 top-[18px] flex h-[26px] w-[26px] items-center justify-center rounded-md text-[#8FA1BC] hover:text-white"
            >
              <CloseIcon />
            </button>
            <div className="relative flex items-center gap-[26px]">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[14px] bg-white/[0.08]">
                <SparkleIcon />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-[9px] flex items-center gap-2">
                  <span className="rounded bg-emerald px-2 py-[3px] font-mono text-[10px] font-bold uppercase tracking-wide text-white">
                    {announcement.badge}
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-wide text-[#8FA1BC]">
                    {announcement.kicker}
                  </span>
                </div>
                <h2 className="mb-1.5 font-serif text-2xl font-semibold text-white">{announcement.headline}</h2>
                <p className="mb-4 max-w-[560px] text-sm leading-relaxed text-[#C9D4E3]">{announcement.body}</p>
                <Link
                  href={announcement.ctaHref}
                  className="inline-block rounded-md bg-emerald px-6 py-3 text-sm font-bold text-white hover:bg-emerald-dark"
                >
                  {announcement.ctaLabel}
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="mb-3 mt-[30px] flex items-baseline justify-between">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
            Quick Access
          </span>
          <Link href="/tools" className="text-[12.5px] font-medium text-emerald hover:text-emerald-dark">
            See all tools &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-3 gap-3.5">
          {QUICK_ACCESS.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="rounded-xl border border-[#E4E8ED] bg-white p-6 shadow-level-1 transition-shadow hover:shadow-level-2"
            >
              <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-[10px] bg-emerald-soft">
                {item.name === 'Convert' && <ConvertIcon color="#1E9D75" />}
                {item.name === 'Organize & Protect' && <ProtectIcon color="#1E9D75" />}
                {/* AI-context icons are always --emerald, never a substitute
                    color — see brief-ai-desktop-design-details.md. */}
                {item.name === 'AI Tools' && <AiIcon color="#1E9D75" />}
              </div>
              <div className="mb-1 font-serif text-lg font-semibold text-navy">{item.name}</div>
              <div className="text-[13.5px] leading-relaxed text-ink-soft">{item.description}</div>
              <div className="mt-3.5 flex items-center gap-1.5 border-t border-[#EEF1F4] pt-3">
                {item.local ? (
                  <span className="h-[5px] w-[5px] rounded-full bg-emerald" />
                ) : (
                  <span className="text-ink-soft">
                    <GlobeIcon />
                  </span>
                )}
                <span className="font-mono text-[11px] text-ink-soft">{item.count}</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mb-3 mt-7 flex items-baseline justify-between">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-ink-soft">
            Recent Files
          </span>
          <Link href="/library" className="text-[12.5px] font-medium text-emerald hover:text-emerald-dark">
            Open library &rarr;
          </Link>
        </div>

        <div className="overflow-hidden rounded-2xl border border-paper-line bg-white shadow-level-1">
          {recentFiles === null && (
            <div className="rounded-xl bg-surface py-12 text-center text-sm text-ink-soft">Loading&hellip;</div>
          )}
          {recentFiles?.length === 0 && (
            <div className="rounded-xl bg-surface py-12 text-center text-sm text-ink-soft">
              {token ? 'Nothing in your Library yet.' : 'Log in to sync files here, or use a tool to get started.'}
            </div>
          )}
          {recentFiles?.map((doc, i) => (
            <RecentFileRow key={doc.id} doc={doc} isLast={i === recentFiles.length - 1} />
          ))}
        </div>
      </main>
      <ActivityBall />
    </div>
  );
}

function RecentFileRow({ doc, isLast }: { doc: LibraryDocumentSummary; isLast: boolean }) {
  const countdown = useCountdown(doc.expiresAt);

  return (
    <div className={`flex items-center gap-3.5 px-[18px] py-3.5 ${isLast ? '' : 'border-b border-paper-line'}`}>
      <FileIcon />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13.5px] font-semibold text-navy">{doc.filename}</div>
        <div className="mt-0.5 text-[11.5px] text-ink-soft">{doc.docType ?? 'Document'}</div>
      </div>
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide ${COUNTDOWN_BADGE_CLASS[countdown.urgency]}`}
      >
        {countdown.label}
      </span>
      <span className="w-[74px] shrink-0 text-right text-[11.5px] text-ink-soft">
        {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
      </span>
    </div>
  );
}

// Stroke-based icons on a 24px viewBox, matching weight/style across the set.
const iconProps = (color: string) => ({
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: color,
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

function ConvertIcon({ color = 'rgba(255,255,255,0.62)' }: { color?: string }) {
  return (
    <svg {...iconProps(color)}>
      <path d="M7 7h10M7 7l3-3M7 7l3 3" />
      <path d="M17 17H7M17 17l-3-3M17 17l-3 3" />
    </svg>
  );
}
function ProtectIcon({ color = 'rgba(255,255,255,0.62)' }: { color?: string }) {
  return (
    <svg {...iconProps(color)}>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" />
    </svg>
  );
}
function AiIcon({ color = 'rgba(255,255,255,0.62)' }: { color?: string }) {
  return (
    <svg {...iconProps(color)}>
      <path d="M12 3l1.8 5.5L19 10l-5.2 1.5L12 17l-1.8-5.5L5 10l5.2-1.5L12 3z" />
    </svg>
  );
}
function CloseIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}
function SparkleIcon() {
  return (
    <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#1E9D75" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l18-7-7 18-2.5-7.5L3 11z" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v5M12 16h.01" />
    </svg>
  );
}
function FileIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#4B5768" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M6 3h9l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}
