import { stripLocalePrefix } from './i18n/locales';

export type DesktopNavKey =
  | 'home'
  | 'convert'
  | 'organize'
  | 'protect'
  | 'ai-tools'
  | 'library'
  | 'recent'
  | 'wallet'
  | 'referrals'
  | 'settings';

// Maps each individual tool page's route (under the (tools) group) to the
// desktop sidebar category it belongs to, mirroring ToolsIndex's
// TOOLS_BY_TAB grouping so a tool page opened directly (e.g. /merge)
// highlights the right sidebar item.
const TOOL_ROUTE_CATEGORY: Record<string, DesktopNavKey> = {
  // Convert
  'pdf-to-images': 'convert',
  'images-to-pdf': 'convert',
  'word-to-pdf': 'convert',
  'pdf-to-word': 'convert',
  'excel-to-pdf': 'convert',
  'pdf-to-excel': 'convert',
  'powerpoint-to-pdf': 'convert',
  'pdf-to-powerpoint': 'convert',
  'pdf-to-text': 'convert',
  'pdf-to-html': 'convert',
  // Organize
  merge: 'organize',
  split: 'organize',
  organize: 'organize',
  rotate: 'organize',
  'page-numbers': 'organize',
  compress: 'organize',
  'compress-high-ratio': 'organize',
  ocr: 'organize',
  // Protect
  sign: 'protect',
  protect: 'protect',
  'remove-password': 'protect',
  watermark: 'protect',
  // AI tools
  'batch-invoices': 'ai-tools',
  'contract-compare': 'ai-tools',
  'high-risk-clauses': 'ai-tools',
  'plain-summary': 'ai-tools',
  'nda-audit': 'ai-tools',
  'redaction-detector': 'ai-tools',
  'duplicate-payments': 'ai-tools',
  'financial-ratios': 'ai-tools',
  'bank-reconciliation': 'ai-tools',
  'tax-deductible': 'ai-tools',
  'multi-paper-compare': 'ai-tools',
  'methodology-extractor': 'ai-tools',
  'presentation-outline': 'ai-tools',
};

const TAB_SLUG_TO_NAV_KEY: Record<string, DesktopNavKey> = {
  convert: 'convert',
  organize: 'organize',
  protect: 'protect',
  'ai-tools': 'ai-tools',
};

// Maps the current pathname (plus, for /tools, its `tab` query param) to
// which desktop sidebar item should be highlighted. `tabParam` is optional
// so callers that can't cheaply read search params (or are on a route
// where it doesn't apply) still get the pathname-only behavior.
export function getDesktopNavKeyForPath(pathname: string, tabParam?: string | null): DesktopNavKey {
  // Strip a leading locale prefix (`/fr/protect` -> `/protect`) — the
  // desktop app never sees one (it stays on unprefixed routes by design),
  // but the web app's sidebar/nav share this same lookup and do see them.
  const segment = stripLocalePrefix(pathname).split('/').filter(Boolean)[0] ?? '';
  if (segment === 'desktop-home' || segment === '') return 'home';
  if (segment === 'library') return 'library';
  if (segment === 'recent') return 'recent';
  if (segment === 'wallet') return 'wallet';
  if (segment === 'referrals') return 'referrals';
  if (segment === 'settings') return 'settings';
  if (segment === 'tools') return (tabParam && TAB_SLUG_TO_NAV_KEY[tabParam]) || 'convert';
  return TOOL_ROUTE_CATEGORY[segment] ?? 'home';
}
