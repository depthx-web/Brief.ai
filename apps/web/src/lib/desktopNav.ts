export type DesktopNavKey = 'home' | 'convert' | 'organize' | 'protect' | 'ai-tools' | 'library' | 'recent';

// Slugs used in `/tools?tab=<slug>` links from the desktop sidebar — kept
// separate from ToolsIndex's own `Tab` union (which uses display strings
// like "AI tools") so the URL doesn't leak that display casing.
export const TAB_SLUG_TO_TAB: Record<string, 'Convert' | 'Organize' | 'Protect' | 'AI tools'> = {
  convert: 'Convert',
  organize: 'Organize',
  protect: 'Protect',
  'ai-tools': 'AI tools',
};

export const DESKTOP_NAV_KEY_TO_TAB_SLUG: Partial<Record<DesktopNavKey, string>> = {
  convert: 'convert',
  organize: 'organize',
  protect: 'protect',
  'ai-tools': 'ai-tools',
};

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

// Best-effort mapping from the current pathname to which desktop sidebar
// item should be highlighted. Approximate for `/tools` itself (it's a
// client-side tab switcher, not separate routes) — defaults to 'convert'.
export function getDesktopNavKeyForPath(pathname: string): DesktopNavKey {
  const segment = pathname.split('/').filter(Boolean)[0] ?? '';
  if (segment === 'desktop-home' || segment === '') return 'home';
  if (segment === 'library') return 'library';
  if (segment === 'recent') return 'recent';
  if (segment === 'tools') return 'convert';
  return TOOL_ROUTE_CATEGORY[segment] ?? 'home';
}
