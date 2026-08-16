-- CreateTable
CREATE TABLE `CreditPack` (
    `id` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `priceCents` INTEGER NOT NULL,
    `isBestValue` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreditTransaction` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `delta` INTEGER NOT NULL,
    `reason` ENUM('PURCHASE', 'AI_USAGE', 'MANUAL_ADMIN_ADJUSTMENT') NOT NULL,
    `adminNote` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CreditTransaction_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlatformSettings` (
    `id` VARCHAR(191) NOT NULL,
    `creditsEnabled` BOOLEAN NOT NULL DEFAULT true,
    `commissionSignupPercent` INTEGER NOT NULL DEFAULT 5,
    `commissionRenewalPercent` INTEGER NOT NULL DEFAULT 3,
    `paypalFeePercent` DOUBLE NOT NULL DEFAULT 2.9,
    `paypalFeeFixedCents` INTEGER NOT NULL DEFAULT 30,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CreditTransaction` ADD CONSTRAINT `CreditTransaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed: the single settings row (id is the fixed literal "singleton" —
-- see PlatformSettingsService, which always reads/writes this one id).
INSERT INTO `PlatformSettings` (`id`, `updatedAt`) VALUES ('singleton', NOW(3));

-- Seed: starter credit packs. Pricing safeguard (Batch 5, Part 6 §7):
-- credits must never be the cheaper option at moderate usage. The platform's
-- cheapest subscription is Researcher Monthly at $7.00/mo for unlimited AI
-- use (see PlanPrice seed in 20260814160000_add_plan_prices_and_features).
-- At the best-value rate below (~$1.90/credit), 4 credits already cost
-- $7.60 — more than that unlimited subscription — so anyone doing 4-5
-- operations a month is still better off subscribing, exactly as required.
INSERT INTO `CreditPack` (`id`, `size`, `priceCents`, `isBestValue`, `order`) VALUES
  (UUID(), 5, 1100, false, 0),
  (UUID(), 20, 3800, true, 1);
