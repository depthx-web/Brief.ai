-- CreateEnum equivalents (MySQL inlines enums as column types)
-- AlterTable
ALTER TABLE `User`
  ADD COLUMN `plan` ENUM('FREE', 'PAID') NOT NULL DEFAULT 'FREE',
  ADD COLUMN `billingCycle` ENUM('WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY') NULL,
  ADD COLUMN `lemonSqueezyCustomerId` VARCHAR(191) NULL,
  ADD COLUMN `lemonSqueezySubscriptionId` VARCHAR(191) NULL,
  ADD COLUMN `subscriptionStatus` VARCHAR(191) NULL,
  ADD COLUMN `currentPeriodEnd` DATETIME(3) NULL,
  ADD COLUMN `liteLlmVirtualKey` TEXT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_lemonSqueezySubscriptionId_key` ON `User`(`lemonSqueezySubscriptionId`);
