-- Email verification (wires the already-existing but unused
-- SIGNUP_CONFIRMATION email trigger to a real flow): a token-based confirm
-- link, sent at signup, sets emailVerifiedAt when clicked.

-- AlterTable
ALTER TABLE `User`
  ADD COLUMN `emailVerifiedAt` DATETIME(3) NULL,
  ADD COLUMN `emailVerificationToken` VARCHAR(191) NULL,
  ADD COLUMN `emailVerificationExpiresAt` DATETIME(3) NULL;

-- Backfill: existing accounts predate this feature and must not be
-- retroactively treated as unverified — only new signups start unverified.
UPDATE `User` SET `emailVerifiedAt` = `createdAt` WHERE `emailVerifiedAt` IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX `User_emailVerificationToken_key` ON `User`(`emailVerificationToken`);
