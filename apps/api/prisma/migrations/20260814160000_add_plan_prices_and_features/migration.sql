-- CreateTable
CREATE TABLE `PlanPrice` (
    `id` VARCHAR(191) NOT NULL,
    `segment` ENUM('LAWYER', 'ACCOUNTANT', 'RESEARCHER') NOT NULL,
    `cycle` ENUM('WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NOT NULL,
    `priceCents` INTEGER NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PlanPrice_segment_cycle_key`(`segment`, `cycle`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Feature` (
    `id` VARCHAR(191) NOT NULL,
    `segment` ENUM('LAWYER', 'ACCOUNTANT', 'RESEARCHER') NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `freeEnabled` BOOLEAN NOT NULL DEFAULT false,
    `proEnabled` BOOLEAN NOT NULL DEFAULT true,
    `order` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `Feature_segment_key_key`(`segment`, `key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Seed: prices derived from the original arithmetic (monthly base, 10% off
-- quarterly, 20% off yearly) so the admin panel starts showing today's live
-- prices rather than zeros.
INSERT INTO `PlanPrice` (`id`, `segment`, `cycle`, `priceCents`, `updatedAt`) VALUES
  (UUID(), 'LAWYER', 'WEEKLY', 1500, NOW(3)),
  (UUID(), 'LAWYER', 'MONTHLY', 6000, NOW(3)),
  (UUID(), 'LAWYER', 'QUARTERLY', 16200, NOW(3)),
  (UUID(), 'LAWYER', 'YEARLY', 57600, NOW(3)),
  (UUID(), 'ACCOUNTANT', 'WEEKLY', 500, NOW(3)),
  (UUID(), 'ACCOUNTANT', 'MONTHLY', 2000, NOW(3)),
  (UUID(), 'ACCOUNTANT', 'QUARTERLY', 5400, NOW(3)),
  (UUID(), 'ACCOUNTANT', 'YEARLY', 19200, NOW(3)),
  (UUID(), 'RESEARCHER', 'WEEKLY', 175, NOW(3)),
  (UUID(), 'RESEARCHER', 'MONTHLY', 700, NOW(3)),
  (UUID(), 'RESEARCHER', 'QUARTERLY', 1890, NOW(3)),
  (UUID(), 'RESEARCHER', 'YEARLY', 6720, NOW(3));

-- Seed: one Feature row per AiOperation each segment's Workspace actually
-- calls, all starting proEnabled/not-freeEnabled — matching today's
-- behavior (AI is paid-only once BILLING_ENFORCED is on) until an admin
-- flips one on for the Free plan.
INSERT INTO `Feature` (`id`, `segment`, `key`, `label`, `freeEnabled`, `proEnabled`, `order`) VALUES
  (UUID(), 'LAWYER', 'SUMMARIZE', 'Quick summary', false, true, 0),
  (UUID(), 'LAWYER', 'ANALYZE_CLAUSES', 'Clause risk detection', false, true, 1),
  (UUID(), 'LAWYER', 'CHAT', 'Document chat', false, true, 2),
  (UUID(), 'ACCOUNTANT', 'SUMMARIZE', 'Quick summary', false, true, 0),
  (UUID(), 'ACCOUNTANT', 'EXTRACT_INVOICE', 'Invoice data extraction', false, true, 1),
  (UUID(), 'ACCOUNTANT', 'CHAT', 'Document chat', false, true, 2),
  (UUID(), 'RESEARCHER', 'SUMMARIZE', 'Quick summary', false, true, 0),
  (UUID(), 'RESEARCHER', 'EXTRACT_REFERENCES', 'Reference export', false, true, 1),
  (UUID(), 'RESEARCHER', 'CHAT', 'Document chat', false, true, 2);
