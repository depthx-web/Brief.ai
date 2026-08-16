'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import type { Segment } from '@/lib/authApi';
import { fetchPublicFeatures, type PublicFeature } from '@/lib/billingApi';
import { getCreditBalance } from '@/lib/creditsApi';
import ToolSourceModal from './ToolSourceModal';
import GuestSignupModal from './GuestSignupModal';
import UpgradePromptModal from './UpgradePromptModal';

// Maps the homepage's "See all X tools →" links (?workspace=legal) to the
// same segment values used for filtering everywhere else.
const WORKSPACE_PARAM_TO_SEGMENT: Record<string, Segment> = {
  legal: 'LAWYER',
  accounting: 'ACCOUNTANT',
  research: 'RESEARCHER',
};

interface Tool {
  href: string;
  name: string;
  stamp: string;
  description: string;
  // Static default, used as-is for tools with no featureKey (server-side
  // conversions gated by RequirePaidPlanGuard, not by the Feature table).
  // For AI tools (featureKey set), the actual PRO badge is computed live
  // from that feature's freeEnabled flag instead — see proForTool().
  pro?: boolean;
  ai?: boolean;
  // The Feature.key this card corresponds to (admin's "Features per plan"
  // panel) — lets the PRO badge react live to an admin toggling it free,
  // instead of staying hardcoded regardless of what's actually configured.
  featureKey?: string;
  // Omitted = every workspace. Set only on tools built for one profession
  // (e.g. Batch Invoice Export), so the grid re-filters on workspace switch.
  segments?: Segment[];
  // Only tools that take exactly one existing PDF get the "upload new vs.
  // choose from Library" modal — Merge/Images-to-PDF/etc, and the two-file
  // compare tools (which run their own picker), go straight to their page.
  singleFileSource?: boolean;
  // ISO date the tool launched — drives the "New" badge for its first 30 days.
  launchedAt?: string;
  borderVariant?: 'redline';
}

const NEW_BADGE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

const SEGMENT_GROUP: Record<Segment, { icon: string; label: string }> = {
  LAWYER: { icon: '⚖️', label: 'Legal' },
  ACCOUNTANT: { icon: '🧮', label: 'Accounting' },
  RESEARCHER: { icon: '📖', label: 'Research' },
};
const SEGMENT_ORDER: Segment[] = ['LAWYER', 'ACCOUNTANT', 'RESEARCHER'];

function isNew(launchedAt: string | undefined): boolean {
  if (!launchedAt) return false;
  return Date.now() - new Date(launchedAt).getTime() < NEW_BADGE_WINDOW_MS;
}

const TABS = ['Convert', 'Organize', 'Protect', 'AI tools'] as const;
type Tab = (typeof TABS)[number];

const TOOLS_BY_TAB: Record<Tab, Tool[]> = {
  Convert: [
    { href: '/pdf-to-images', name: 'PDF to Images', stamp: 'PDF→IMG', description: 'Export every page as a JPG or PNG.', singleFileSource: true },
    { href: '/images-to-pdf', name: 'Images to PDF', stamp: 'IMG→PDF', description: 'Combine JPG or PNG images into a PDF.' },
    { href: '/word-to-pdf', name: 'Word to PDF', stamp: 'DOC→PDF', description: 'Convert a Word document to PDF.', pro: true, featureKey: 'WORD_TO_PDF' },
    { href: '/pdf-to-word', name: 'PDF to Word', stamp: 'PDF→DOC', description: 'Convert a PDF to an editable Word document.', pro: true, singleFileSource: true, featureKey: 'PDF_TO_WORD' },
    { href: '/excel-to-pdf', name: 'Excel to PDF', stamp: 'XLS→PDF', description: 'Convert an Excel spreadsheet to PDF.', pro: true, featureKey: 'EXCEL_TO_PDF' },
    { href: '/pdf-to-excel', name: 'PDF to Excel', stamp: 'PDF→XLS', description: 'Convert a PDF to an editable Excel spreadsheet.', pro: true, singleFileSource: true, featureKey: 'PDF_TO_EXCEL' },
    { href: '/powerpoint-to-pdf', name: 'PowerPoint to PDF', stamp: 'PPT→PDF', description: 'Convert a PowerPoint presentation to PDF.', pro: true, featureKey: 'POWERPOINT_TO_PDF' },
    { href: '/pdf-to-powerpoint', name: 'PDF to PowerPoint', stamp: 'PDF→PPT', description: 'Convert a PDF to an editable PowerPoint presentation.', pro: true, singleFileSource: true, featureKey: 'PDF_TO_POWERPOINT' },
    { href: '/pdf-to-text', name: 'PDF to Text', stamp: 'PDF→TXT', description: 'Extract every page’s text into a .txt file.', singleFileSource: true },
    { href: '/pdf-to-html', name: 'PDF to Web Page', stamp: 'PDF→HTML', description: 'Convert a PDF into a single styled HTML page.', pro: true, singleFileSource: true, featureKey: 'PDF_TO_HTML' },
  ],
  Organize: [
    { href: '/merge', name: 'Merge', stamp: 'MERGE', description: 'Combine multiple PDFs into one file.' },
    { href: '/split', name: 'Split', stamp: 'SPLIT', description: 'Extract page ranges or every page individually.', singleFileSource: true },
    { href: '/organize', name: 'Reorder', stamp: 'ORDER', description: 'Drag to reorder pages within a PDF.', singleFileSource: true },
    { href: '/organize', name: 'Delete Pages', stamp: 'DELETE', description: 'Remove specific pages from a PDF.', singleFileSource: true },
    { href: '/rotate', name: 'Rotate', stamp: 'ROTATE', description: 'Rotate every page in a PDF.', singleFileSource: true },
    { href: '/page-numbers', name: 'Page Numbers', stamp: 'PAGES', description: 'Stamp page numbers onto every page.', singleFileSource: true },
    { href: '/compress', name: 'Compress', stamp: 'ZIP', description: 'Shrink file size for scanned or image-heavy PDFs.', singleFileSource: true },
    { href: '/compress-high-ratio', name: 'Compress (High Ratio)', stamp: 'ZIP+', description: 'Server-side high-ratio compression that keeps text sharp and selectable.', pro: true, singleFileSource: true, featureKey: 'COMPRESS_HIGH_RATIO' },
    { href: '/ocr', name: 'OCR', stamp: 'OCR', description: 'Make a scanned PDF searchable and selectable.', singleFileSource: true },
  ],
  Protect: [
    { href: '/sign', name: 'Sign', stamp: 'SIGN', description: 'Draw or upload a signature and place it on a page.', singleFileSource: true },
    { href: '/protect', name: 'Protect', stamp: 'LOCK', description: 'Add a password so only people who know it can open the file.', pro: true, singleFileSource: true, featureKey: 'PROTECT_PDF' },
    { href: '/remove-password', name: 'Remove Password', stamp: 'UNLOCK', description: 'Remove password protection given the current password.', pro: true, singleFileSource: true, featureKey: 'REMOVE_PASSWORD' },
    { href: '/watermark', name: 'Watermark', stamp: 'STAMP', description: 'Stamp text across every page.', singleFileSource: true },
  ],
  'AI tools': [
    {
      href: '/batch-invoices',
      name: 'Batch Invoice Export',
      stamp: 'INVOICE',
      description: 'Extract data from many invoices at once and export to CSV.',
      pro: true,
      ai: true,
      segments: ['ACCOUNTANT'],
      featureKey: 'EXTRACT_INVOICE',
    },
    // Lawyer
    {
      href: '/contract-compare',
      name: 'Contract Compare',
      stamp: 'COMPARE',
      description: 'Compare two versions of a contract with AI-flagged risk on what changed.',
      pro: true,
      ai: true,
      segments: ['LAWYER'],
      launchedAt: '2026-08-15',
      featureKey: 'COMPARE_CONTRACTS',
    },
    {
      href: '/high-risk-clauses',
      name: 'High-Risk Clause Detector',
      stamp: 'CLAUSE',
      description: 'Flags unfair, incomplete, or non-standard clauses.',
      pro: true,
      ai: true,
      segments: ['LAWYER'],
      featureKey: 'ANALYZE_CLAUSES',
    },
    {
      href: '/plain-summary',
      name: 'Plain-Language Summary Generator',
      stamp: 'PLAIN',
      description: 'Turns a contract into a summary a non-legal client can understand.',
      pro: true,
      ai: true,
      segments: ['LAWYER'],
      singleFileSource: true,
      launchedAt: '2026-08-15',
      featureKey: 'SUMMARIZE_PLAIN',
    },
    {
      href: '/nda-audit',
      name: 'Quick NDA Auditor',
      stamp: 'NDA',
      description: 'Checks an NDA against confidentiality duration, exceptions, and scope.',
      pro: true,
      ai: true,
      segments: ['LAWYER'],
      singleFileSource: true,
      launchedAt: '2026-08-15',
      featureKey: 'AUDIT_NDA',
    },
    {
      href: '/redaction-detector',
      name: 'Auto-Redaction of Sensitive Data',
      stamp: 'REDACT',
      description: 'Detects ID and bank account numbers worth redacting before sharing.',
      pro: true,
      ai: true,
      segments: ['LAWYER'],
      singleFileSource: true,
      launchedAt: '2026-08-15',
      borderVariant: 'redline',
      featureKey: 'DETECT_SENSITIVE_DATA',
    },
    // Accountant
    {
      href: '/duplicate-payments',
      name: 'Duplicate Payment Detector',
      stamp: 'DUPE',
      description: 'Flags the same vendor, amount, and date appearing more than once.',
      pro: true,
      ai: true,
      segments: ['ACCOUNTANT'],
      featureKey: 'DETECT_DUPLICATE_PAYMENTS',
    },
    {
      href: '/financial-ratios',
      name: 'Financial Ratio Analyzer',
      stamp: 'RATIO',
      description: 'Extracts liquidity and profitability ratios and explains them plainly.',
      pro: true,
      ai: true,
      segments: ['ACCOUNTANT'],
      singleFileSource: true,
      launchedAt: '2026-08-15',
      featureKey: 'ANALYZE_FINANCIAL_RATIOS',
    },
    {
      href: '/bank-reconciliation',
      name: 'Bank Reconciliation Assistant',
      stamp: 'RECON',
      description: 'Compares a bank statement against recorded invoices for discrepancies.',
      pro: true,
      ai: true,
      segments: ['ACCOUNTANT'],
      launchedAt: '2026-08-15',
      featureKey: 'RECONCILE_BANK',
    },
    {
      href: '/tax-deductible',
      name: 'Tax-Deductible Expense Flagger',
      stamp: 'TAX',
      description: 'Highlights likely tax-deductible line items by category.',
      pro: true,
      ai: true,
      segments: ['ACCOUNTANT'],
      singleFileSource: true,
      launchedAt: '2026-08-15',
      featureKey: 'FLAG_DEDUCTIBLE_EXPENSES',
    },
    // Researcher
    {
      href: '/library',
      name: 'Chat with the Paper',
      stamp: 'CHAT',
      description: 'Ask questions about any paper in your library and get cited answers.',
      pro: true,
      ai: true,
      segments: ['RESEARCHER'],
      featureKey: 'CHAT',
    },
    {
      href: '/multi-paper-compare',
      name: 'Multi-Paper Compare',
      stamp: 'COMPARE',
      description: 'Compares the methodology and results of two papers side by side.',
      pro: true,
      ai: true,
      segments: ['RESEARCHER'],
      launchedAt: '2026-08-15',
      featureKey: 'COMPARE_PAPERS',
    },
    {
      href: '/methodology-extractor',
      name: 'Methodology Extractor',
      stamp: 'METHOD',
      description: 'Summarizes methodology into a structured sample/tools/analysis table.',
      pro: true,
      ai: true,
      segments: ['RESEARCHER'],
      singleFileSource: true,
      launchedAt: '2026-08-15',
      featureKey: 'EXTRACT_METHODOLOGY',
    },
    {
      href: '/presentation-outline',
      name: 'Presentation Outline Generator',
      stamp: 'SLIDES',
      description: 'Turns the paper into a set of slide-ready talking points.',
      pro: true,
      ai: true,
      segments: ['RESEARCHER'],
      singleFileSource: true,
      launchedAt: '2026-08-15',
      featureKey: 'GENERATE_OUTLINE',
    },
  ],
};

function ToolsIndexInner() {
  const { user, token } = useAuth();
  const searchParams = useSearchParams();
  const workspaceParam = searchParams.get('workspace');
  const overrideSegment = workspaceParam ? WORKSPACE_PARAM_TO_SEGMENT[workspaceParam] : null;
  const effectiveSegment = overrideSegment ?? user?.segment ?? null;

  const [tab, setTab] = useState<Tab>(overrideSegment ? 'AI tools' : 'Organize');
  const [sourceModalHref, setSourceModalHref] = useState<string | null>(null);
  const [signupModalTool, setSignupModalTool] = useState<string | null>(null);
  const [upgradeTool, setUpgradeTool] = useState<string | null>(null);
  const [features, setFeatures] = useState<PublicFeature[]>([]);
  // null = not checked yet. Only used to hold back a confirmed zero balance
  // from blocking a click — while it's still loading, let the click through
  // and rely on the server-side check rather than risk a false block.
  const [creditBalance, setCreditBalance] = useState<number | null>(null);

  useEffect(() => {
    fetchPublicFeatures()
      .then(setFeatures)
      .catch(() => setFeatures([]));
  }, []);

  useEffect(() => {
    if (!token) return;
    getCreditBalance(token)
      .then(setCreditBalance)
      .catch(() => {});
  }, [token]);

  // With no known segment (a guest, or a signed-in user who hasn't picked a
  // workspace yet) every AI tool has a `segments` restriction, so filtering
  // strictly would empty the whole "AI tools" tab — showing nothing convinces
  // no one to sign up. Show every tool unfiltered instead; only narrow once
  // an actual segment (logged-in or ?workspace=) is known.
  const tools = useMemo(
    () => TOOLS_BY_TAB[tab].filter((tool) => !tool.segments || !effectiveSegment || tool.segments.includes(effectiveSegment)),
    [tab, effectiveSegment]
  );

  // Same live wiring as the Pricing page: a tool tagged with a featureKey
  // shows PRO exactly when that segment's feature isn't toggled freeEnabled
  // in the admin panel — flip it there and the badge here updates with it,
  // instead of staying hardcoded regardless of what's actually configured.
  function isProTool(tool: Tool): boolean {
    if (!tool.featureKey) return tool.pro ?? false;
    // Segment-scoped AI tools match their own segment's row; tools with no
    // `segments` (Office<->PDF, Protect, Remove Password) match the
    // null-segment row that applies to every workspace.
    const feature = features.find(
      (f) => f.key === tool.featureKey && (tool.segments?.length ? f.segment === tool.segments![0] : f.segment === null)
    );
    return feature ? !feature.freeEnabled : (tool.pro ?? false);
  }

  // Applies to every feature-gated tool (any tool with a featureKey — the 14
  // AI operations and the 4 tools that used to sit behind the blanket paid
  // guard alike), not just AI-flagged ones: FeatureGuard always requires an
  // account for these regardless of tier, so a guest needs the signup
  // prompt even when the tool itself is currently toggled free.
  function handleToolClick(tool: Tool, e: React.MouseEvent) {
    if (tool.featureKey) {
      // 1. No account at all — request login/signup first.
      if (!user) {
        e.preventDefault();
        setSignupModalTool(tool.name);
        return;
      }
      // 2. Logged in — verify they actually have access before letting them
      // into the tool: a paid plan, or (for a PRO tool) a credit balance.
      // Catches the paywall up front instead of after they've uploaded a
      // file and run the operation only to hit a 403 from the server.
      if (isProTool(tool) && user.plan !== 'PAID' && creditBalance === 0) {
        e.preventDefault();
        setUpgradeTool(tool.name);
        return;
      }
    }
    if (tool.singleFileSource) {
      e.preventDefault();
      setSourceModalHref(tool.href);
    }
  }

  function renderToolCard(tool: Tool) {
    // "Rubber stamp" double outline — a real border plus a same-color
    // outline offset 2px out, rather than CSS `border-double` (which needs
    // ~10px of width before the two lines actually read as separate at
    // normal card size — at a normal 3-4px width it just looks like one
    // thin line, which was the original complaint).
    const stampColorClass =
      tool.borderVariant === 'redline'
        ? 'border-redline outline-redline'
        : tool.ai
          ? 'border-emerald outline-emerald'
          : 'border-navy-light outline-navy-light';
    const stampClass = tool.borderVariant === 'redline' ? 'text-redline' : tool.ai ? 'text-emerald' : 'text-ink';
    const cardClass = `group relative flex aspect-square flex-col items-center justify-center rounded-[20px] border-2 outline outline-2 outline-offset-2 bg-white p-4 text-center shadow-level-1 transition-all duration-200 hover:-rotate-2 hover:shadow-level-2 ${stampColorClass}`;
    const inner = (
      <>
        {isProTool(tool) && (
          <span className="absolute right-2 top-2 rounded bg-navy-light px-1.5 py-0.5 font-mono text-[9px] font-semibold text-white">
            PRO
          </span>
        )}
        {isNew(tool.launchedAt) && (
          <span className="absolute right-2 top-8 rounded bg-amber-200 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-amber-800">
            NEW
          </span>
        )}
        {tool.ai && (
          <span className="absolute left-2 top-2 text-emerald" aria-hidden>
            ✨
          </span>
        )}
        <span className={`font-mono text-sm font-bold uppercase tracking-wide ${stampClass}`}>{tool.stamp}</span>
        <span className="mt-2 text-xs text-ink-soft">{tool.name}</span>
      </>
    );

    // Keyed by name, not href — a few tools (Reorder/Delete Pages) share the
    // same underlying page since it already covers both, so href isn't
    // guaranteed unique across the catalog.
    return tool.singleFileSource ? (
      <button key={tool.name} title={tool.description} onClick={(e) => handleToolClick(tool, e)} className={cardClass}>
        {inner}
      </button>
    ) : (
      <a key={tool.name} href={tool.href} title={tool.description} onClick={(e) => handleToolClick(tool, e)} className={cardClass}>
        {inner}
      </a>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
      <h1 className="font-serif text-2xl font-medium text-navy">All my tools in one place</h1>

      <div className="relative mt-8 flex gap-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-t-lg px-5 pb-3 pt-2.5 text-sm font-medium transition-all ${
              tab === t
                ? 'bg-paper text-navy shadow-[0_-2px_8px_rgba(0,0,0,0.06)]'
                : 'bg-gray-100 text-ink-soft opacity-70 hover:opacity-90'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="rounded-b-xl rounded-tr-xl border border-paper-line bg-paper p-8">
        {tab === 'AI tools' && !effectiveSegment ? (
          <div key={`${tab}-${effectiveSegment}`} className="fade-in-200 space-y-10">
            {SEGMENT_ORDER.map((segment) => {
              const group = tools.filter((tool) => tool.segments?.includes(segment));
              if (group.length === 0) return null;
              const { icon, label } = SEGMENT_GROUP[segment];
              return (
                <div key={segment}>
                  <h2 className="mb-4 flex items-center gap-2 font-serif text-base font-semibold text-navy">
                    <span aria-hidden>{icon}</span> {label}
                  </h2>
                  <div className="mx-auto grid max-w-[960px] grid-cols-2 gap-6 sm:grid-cols-4">{group.map(renderToolCard)}</div>
                </div>
              );
            })}
          </div>
        ) : (
          // Capped and centered rather than stretched full-width — a sparse
          // tab (e.g. 4 cards in Convert) reads as an intentional, compact
          // row instead of leaving a wide empty gap beside it.
          <div key={`${tab}-${effectiveSegment}`} className="fade-in-200 mx-auto grid max-w-[960px] grid-cols-2 gap-6 sm:grid-cols-4">
            {tools.map(renderToolCard)}
          </div>
        )}
      </div>

      <ToolSourceModal open={sourceModalHref !== null} href={sourceModalHref} onClose={() => setSourceModalHref(null)} />
      <GuestSignupModal open={signupModalTool !== null} toolName={signupModalTool ?? undefined} onClose={() => setSignupModalTool(null)} />
      <UpgradePromptModal open={upgradeTool !== null} toolName={upgradeTool ?? undefined} onClose={() => setUpgradeTool(null)} />
    </div>
  );
}

export default function ToolsIndex() {
  return (
    <Suspense fallback={null}>
      <ToolsIndexInner />
    </Suspense>
  );
}
