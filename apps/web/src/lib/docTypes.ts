import type { Segment } from './authApi';

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

// Project-card top-strip accent, subdued from the same palette family per
// segment — contracts read navy, invoices deep green, research calm amber.
export const CATEGORY_ACCENT: Record<Segment, string> = {
  LAWYER: '#0F2340',
  ACCOUNTANT: '#167A5C',
  RESEARCHER: '#B8842B',
};
