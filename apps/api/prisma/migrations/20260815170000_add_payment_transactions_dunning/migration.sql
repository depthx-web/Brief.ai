-- AlterTable
ALTER TABLE `User`
  ADD COLUMN `dunningAttemptCount` INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN `lastPaymentFailedAt` DATETIME(3) NULL,
  ADD COLUMN `nextDunningRetryAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `PlatformSettings`
  ADD COLUMN `dunningAutoRetryEnabled` BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN `dunningMaxAttempts` INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN `dunningIntervalDays` INTEGER NOT NULL DEFAULT 3;

-- CreateTable
CREATE TABLE `PaymentTransaction` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('SUBSCRIPTION_PAYMENT', 'CREDIT_PURCHASE', 'REFUND') NOT NULL,
    `status` ENUM('SUCCEEDED', 'FAILED', 'REFUNDED') NOT NULL,
    `amountCents` INTEGER NOT NULL,
    `provider` VARCHAR(191) NOT NULL DEFAULT 'LEMON_SQUEEZY',
    `providerReferenceId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PaymentTransaction_userId_idx`(`userId`),
    INDEX `PaymentTransaction_status_idx`(`status`),
    INDEX `PaymentTransaction_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PaymentTransaction` ADD CONSTRAINT `PaymentTransaction_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
