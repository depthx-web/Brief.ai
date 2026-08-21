'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import type { Segment } from '@/lib/authApi';
import { fetchPublicFeatures, type PublicFeature } from '@/lib/billingApi';
import { getCreditBalance } from '@/lib/creditsApi';
import { isTauri } from '@/lib/platform';
import { TABS, TAB_SLUG_TO_TAB, TOOLS_BY_TAB, toolLabelKeys, type Tab, type Tool } from '@/lib/toolCatalog';
import { useLocale } from '@/lib/i18n/LocaleContext';
import type { DictionaryKey } from '@/lib/i18n/dictionaries/en';
import ToolSourceModal from './ToolSourceModal';
import GuestSignupModal from './GuestSignupModal';
import UpgradePromptModal from './UpgradePromptModal';

export { TOOLS_BY_TAB, type Tab, type Tool };

// Maps the homepage's "See all X tools →" links (?workspace=legal) to the
// same segment values used for filtering everywhere else.
const WORKSPACE_PARAM_TO_SEGMENT: Record<string, Segment> = {
  legal: 'LAWYER',
  accounting: 'ACCOUNTANT',
  research: 'RESEARCHER',
};

const NEW_BADGE_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

const SEGMENT_GROUP: Record<Segment, { icon: string; labelKey: DictionaryKey }> = {
  LAWYER: { icon: '⚖️', labelKey: 'segment.legal' },
  ACCOUNTANT: { icon: '🧮', labelKey: 'segment.accounting' },
  RESEARCHER: { icon: '📖', labelKey: 'segment.research' },
};
const SEGMENT_ORDER: Segment[] = ['LAWYER', 'ACCOUNTANT', 'RESEARCHER'];

const TAB_LABEL_KEY: Record<Tab, DictionaryKey> = {
  Convert: 'sidebar.convert',
  Organize: 'sidebar.organize',
  Protect: 'sidebar.protect',
  'AI tools': 'sidebar.aiTools',
};

function isNew(launchedAt: string | undefined): boolean {
  if (!launchedAt) return false;
  return Date.now() - new Date(launchedAt).getTime() < NEW_BADGE_WINDOW_MS;
}

function ToolsIndexInner() {
  const { user, token } = useAuth();
  const { t } = useLocale();
  const searchParams = useSearchParams();
  const workspaceParam = searchParams.get('workspace');
  const overrideSegment = workspaceParam ? WORKSPACE_PARAM_TO_SEGMENT[workspaceParam] : null;
  const effectiveSegment = overrideSegment ?? user?.segment ?? null;

  const tabParam = searchParams.get('tab');
  const initialTab = (tabParam && TAB_SLUG_TO_TAB[tabParam]) || (overrideSegment ? 'AI tools' : 'Organize');
  const [tab, setTab] = useState<Tab>(initialTab);

  // The desktop sidebar has no other way to switch tabs (the on-page strip
  // below is web-only) — a Link to `/tools?tab=organize` from another panel
  // keeps this same component instance mounted, so `tab` needs to react to
  // the query param changing, not just read it once on mount.
  useEffect(() => {
    if (tabParam && TAB_SLUG_TO_TAB[tabParam]) setTab(TAB_SLUG_TO_TAB[tabParam]);
  }, [tabParam]);

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
    const labelKeys = toolLabelKeys(tool.name);
    const displayName = labelKeys ? t(labelKeys.nameKey) : tool.name;
    const displayDescription = labelKeys ? t(labelKeys.descriptionKey) : tool.description;
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
    // Desktop panels use the --paper card tone (these tiles represent an
    // operation on a document) instead of the web catalog's white — see
    // brief-ai-desktop-design-details.md's Tool Grid section.
    const cardBg = isTauri() ? 'bg-paper' : 'bg-white';
    const cardClass = `group relative flex aspect-square flex-col items-center justify-center rounded-[20px] border-2 outline outline-2 outline-offset-2 ${cardBg} p-4 text-center shadow-level-1 transition-all duration-200 hover:-rotate-2 hover:shadow-level-2 ${stampColorClass}`;
    const inner = (
      <>
        {isProTool(tool) ? (
          <span className="absolute end-2 top-2 rounded bg-navy-light px-1.5 py-0.5 font-mono text-[9px] font-semibold text-white">
            {t('toolsIndex.pro')}
          </span>
        ) : (
          <span className="absolute end-2 top-2 rounded bg-emerald-soft px-1.5 py-0.5 font-mono text-[9px] font-semibold text-emerald">
            {t('toolsIndex.free')}
          </span>
        )}
        {isNew(tool.launchedAt) && (
          <span className="absolute end-2 top-8 rounded bg-amber-200 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-amber-800">
            {t('toolsIndex.new')}
          </span>
        )}
        {tool.ai && (
          <span className="absolute start-2 top-2 text-emerald" aria-hidden>
            ✨
          </span>
        )}
        <span className={`font-mono text-sm font-bold uppercase tracking-wide ${stampClass}`}>{tool.stamp}</span>
        <span className="mt-2 text-xs text-ink-soft">{displayName}</span>
      </>
    );

    // Keyed by name, not href — a few tools (Reorder/Delete Pages) share the
    // same underlying page since it already covers both, so href isn't
    // guaranteed unique across the catalog.
    return tool.singleFileSource ? (
      <button key={tool.name} title={displayDescription} onClick={(e) => handleToolClick(tool, e)} className={cardClass}>
        {inner}
      </button>
    ) : (
      <a key={tool.name} href={tool.href} title={displayDescription} onClick={(e) => handleToolClick(tool, e)} className={cardClass}>
        {inner}
      </a>
    );
  }

  const desktop = isTauri();
  // Desktop-dense: reflows to the panel width instead of the web catalog's
  // fixed, centered 4-across grid — see the Tool Grid section of
  // brief-ai-desktop-design-details.md.
  const gridClass = desktop
    ? 'fade-in-200 grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(140px,1fr))]'
    : 'fade-in-200 mx-auto grid max-w-[960px] grid-cols-2 gap-6 sm:grid-cols-4';
  // Convert/Organize/Protect all run locally on desktop (Tauri sidecars +
  // client-side tools); only AI tools need a connection.
  const tabIsLocal = tab !== 'AI tools';

  return (
    <div className={desktop ? 'px-9 py-7' : 'mx-auto max-w-5xl px-8 py-10'}>
      {desktop ? (
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-medium text-navy">{t(TAB_LABEL_KEY[tab])}</h1>
          <div className="mt-1.5 flex items-center gap-1.5 font-mono text-xs text-ink-soft">
            {tabIsLocal ? <span className="h-[5px] w-[5px] rounded-full bg-emerald" /> : <ClockIcon />}
            {t(tabIsLocal ? 'toolsIndex.toolsCountLocal' : 'toolsIndex.toolsCountRemote').replace('{n}', String(TOOLS_BY_TAB[tab].length))}
          </div>
        </div>
      ) : (
        <>
          <h1 className="font-serif text-2xl font-medium text-navy">{t('toolsIndex.allToolsHeading')}</h1>
          <div className="relative mt-8 flex gap-1">
            {TABS.map((tabOption) => (
              <button
                key={tabOption}
                onClick={() => setTab(tabOption)}
                className={`rounded-t-lg px-5 pb-3 pt-2.5 text-sm font-medium transition-all ${
                  tab === tabOption
                    ? 'bg-paper text-navy shadow-[0_-2px_8px_rgba(0,0,0,0.06)]'
                    : 'bg-gray-100 text-ink-soft opacity-70 hover:opacity-90'
                }`}
              >
                {t(TAB_LABEL_KEY[tabOption])}
              </button>
            ))}
          </div>
        </>
      )}

      <div className={desktop ? '' : 'rounded-b-xl rounded-tr-xl border border-paper-line bg-paper p-8'}>
        {tab === 'AI tools' && !effectiveSegment ? (
          <div key={`${tab}-${effectiveSegment}`} className={desktop ? 'space-y-8' : 'fade-in-200 space-y-10'}>
            {SEGMENT_ORDER.map((segment) => {
              const group = tools.filter((tool) => tool.segments?.includes(segment));
              if (group.length === 0) return null;
              const { icon, labelKey } = SEGMENT_GROUP[segment];
              return (
                <div key={segment}>
                  <h2 className="mb-4 flex items-center gap-2 font-serif text-base font-semibold text-navy">
                    <span aria-hidden>{icon}</span> {t(labelKey)}
                  </h2>
                  <div className={gridClass}>{group.map(renderToolCard)}</div>
                </div>
              );
            })}
          </div>
        ) : (
          <div key={`${tab}-${effectiveSegment}`} className={gridClass}>
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

function ClockIcon() {
  return (
    <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}
