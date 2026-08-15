-- AlterTable
ALTER TABLE `AiJob` MODIFY `operation` ENUM(
  'SUMMARIZE', 'CHAT', 'ANALYZE_CLAUSES', 'EXTRACT_REFERENCES', 'EXTRACT_INVOICE',
  'COMPARE_CONTRACTS', 'SUMMARIZE_PLAIN', 'AUDIT_NDA', 'DETECT_SENSITIVE_DATA',
  'ANALYZE_FINANCIAL_RATIOS', 'RECONCILE_BANK', 'FLAG_DEDUCTIBLE_EXPENSES',
  'COMPARE_PAPERS', 'EXTRACT_METHODOLOGY', 'GENERATE_OUTLINE', 'DETECT_DUPLICATE_PAYMENTS'
) NOT NULL;

-- The "Duplicate Payment Detector" AI Tools gateway card (Batch 4, Section
-- 2) is labeled "existing" in the spec but had no backing operation yet —
-- added here alongside the rest of the batch.
INSERT INTO `Feature` (`id`, `segment`, `key`, `label`, `freeEnabled`, `proEnabled`, `order`) VALUES
  (UUID(), 'ACCOUNTANT', 'DETECT_DUPLICATE_PAYMENTS', 'Duplicate Payment Detector', false, true, 6);
