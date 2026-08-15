-- AlterTable
ALTER TABLE `AiJob` MODIFY `operation` ENUM(
  'SUMMARIZE', 'CHAT', 'ANALYZE_CLAUSES', 'EXTRACT_REFERENCES', 'EXTRACT_INVOICE',
  'COMPARE_CONTRACTS', 'SUMMARIZE_PLAIN', 'AUDIT_NDA', 'DETECT_SENSITIVE_DATA',
  'ANALYZE_FINANCIAL_RATIOS', 'RECONCILE_BANK', 'FLAG_DEDUCTIBLE_EXPENSES',
  'COMPARE_PAPERS', 'EXTRACT_METHODOLOGY', 'GENERATE_OUTLINE'
) NOT NULL;

-- CreateTable
CREATE TABLE `SavedSignature` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `imageData` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SavedSignature_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SavedSignature` ADD CONSTRAINT `SavedSignature_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed: Feature rows for the new AI Tools gateway entries (Batch 4), same
-- default posture as every existing AI feature — proEnabled, not
-- freeEnabled, until an admin flips one on for the Free plan.
INSERT INTO `Feature` (`id`, `segment`, `key`, `label`, `freeEnabled`, `proEnabled`, `order`) VALUES
  (UUID(), 'LAWYER', 'COMPARE_CONTRACTS', 'Contract Compare', false, true, 3),
  (UUID(), 'LAWYER', 'SUMMARIZE_PLAIN', 'Plain-Language Summary', false, true, 4),
  (UUID(), 'LAWYER', 'AUDIT_NDA', 'Quick NDA Auditor', false, true, 5),
  (UUID(), 'LAWYER', 'DETECT_SENSITIVE_DATA', 'Auto-Redaction of Sensitive Data', false, true, 6),
  (UUID(), 'ACCOUNTANT', 'ANALYZE_FINANCIAL_RATIOS', 'Financial Ratio Analyzer', false, true, 3),
  (UUID(), 'ACCOUNTANT', 'RECONCILE_BANK', 'Bank Reconciliation Assistant', false, true, 4),
  (UUID(), 'ACCOUNTANT', 'FLAG_DEDUCTIBLE_EXPENSES', 'Tax-Deductible Expense Flagger', false, true, 5),
  (UUID(), 'RESEARCHER', 'COMPARE_PAPERS', 'Multi-Paper Compare', false, true, 3),
  (UUID(), 'RESEARCHER', 'EXTRACT_METHODOLOGY', 'Methodology Extractor', false, true, 4),
  (UUID(), 'RESEARCHER', 'GENERATE_OUTLINE', 'Presentation Outline Generator', false, true, 5);
