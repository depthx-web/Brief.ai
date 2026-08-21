import type { Segment } from './authApi';

// Plain data, deliberately NOT in ToolsIndex.tsx ('use client') — a server
// context (e.g. a page's generateMetadata) importing a named export from a
// 'use client' module gets an empty stand-in object, not the real data, so
// anything a Server Component needs (like this catalog) has to live here.
export interface Tool {
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

export const TABS = ['Convert', 'Organize', 'Protect', 'AI tools'] as const;
export type Tab = (typeof TABS)[number];

// Lets the desktop sidebar (and any other external link) land directly on a
// tab via `/tools?tab=ai-tools` without needing the display-string casing.
export const TAB_SLUG_TO_TAB: Record<string, Tab> = {
  convert: 'Convert',
  organize: 'Organize',
  protect: 'Protect',
  'ai-tools': 'AI tools',
};

// Single source of truth for the tool list — the desktop sidebar's
// workspace-filtered counts, ToolsIndex's catalog grid, and each tool page's
// generateMetadata() all read from this same catalog.
export const TOOLS_BY_TAB: Record<Tab, Tool[]> = {
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
