import type { Segment } from './authApi';
import type { DictionaryKey } from './i18n/dictionaries/en';

// Shared with the Dashboard's quick-upload chips and the Library's new-project
// dialog — same list, single source of truth. Fed to the AI layer as extra
// context so, e.g., an NDA and a court memo get differently-focused analysis
// despite both being LAWYER-segment documents.
export const DOC_TYPES: Record<Segment, string[]> = {
  LAWYER: ['Contract', 'NDA', 'Court memo', 'Official correspondence', 'Incorporation document', 'Official decision'],
  ACCOUNTANT: ['Invoice', 'Bank statement', 'Receipt', 'Payroll document', 'Tax filing', 'Financial statement'],
  RESEARCHER: [
    'Academic paper',
    "Master's/PhD thesis",
    'Conference paper',
    'Preprint',
    'Literature review source',
    'Research dataset info',
  ],
};

// Display-only translation of the canonical (English) values above — the
// English string itself is still what's stored and sent to the AI layer as
// docType, so this never changes DOC_TYPES, only how a chip is labeled.
const DOC_TYPE_LABEL_KEY: Record<string, DictionaryKey> = {
  Contract: 'docType.contract',
  NDA: 'docType.nda',
  'Court memo': 'docType.courtMemo',
  'Official correspondence': 'docType.officialCorrespondence',
  'Incorporation document': 'docType.incorporationDocument',
  'Official decision': 'docType.officialDecision',
  Invoice: 'docType.invoice',
  'Bank statement': 'docType.bankStatement',
  Receipt: 'docType.receipt',
  'Payroll document': 'docType.payrollDocument',
  'Tax filing': 'docType.taxFiling',
  'Financial statement': 'docType.financialStatement',
  'Academic paper': 'docType.academicPaper',
  "Master's/PhD thesis": 'docType.thesis',
  'Conference paper': 'docType.conferencePaper',
  Preprint: 'docType.preprint',
  'Literature review source': 'docType.literatureReviewSource',
  'Research dataset info': 'docType.researchDatasetInfo',
};

export function docTypeLabelKey(docType: string): DictionaryKey | null {
  return DOC_TYPE_LABEL_KEY[docType] ?? null;
}

// Project-card top-strip accent, subdued from the same palette family per
// segment — contracts read navy, invoices deep green, research calm amber.
export const CATEGORY_ACCENT: Record<Segment, string> = {
  LAWYER: '#0F2340',
  ACCOUNTANT: '#167A5C',
  RESEARCHER: '#B8842B',
};
