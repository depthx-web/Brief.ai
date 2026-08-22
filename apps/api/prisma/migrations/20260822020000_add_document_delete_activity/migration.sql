-- AlterTable: add DOCUMENT_DELETED/DOCUMENT_AUTO_DELETED so manual and
-- retention-expiry deletions can be logged to the same Activity feed this
-- enum already powers (see library.service.ts's remove() and
-- project-retention.service.ts's deleteExpiredDocuments()).
ALTER TABLE `AiJob` MODIFY `operation` ENUM(
  'SUMMARIZE', 'CHAT', 'ANALYZE_CLAUSES', 'EXTRACT_REFERENCES', 'EXTRACT_INVOICE',
  'COMPARE_CONTRACTS', 'SUMMARIZE_PLAIN', 'AUDIT_NDA', 'DETECT_SENSITIVE_DATA',
  'ANALYZE_FINANCIAL_RATIOS', 'RECONCILE_BANK', 'FLAG_DEDUCTIBLE_EXPENSES', 'DETECT_DUPLICATE_PAYMENTS',
  'COMPARE_PAPERS', 'EXTRACT_METHODOLOGY', 'GENERATE_OUTLINE',
  'DOCUMENT_DELETED', 'DOCUMENT_AUTO_DELETED'
) NOT NULL;
