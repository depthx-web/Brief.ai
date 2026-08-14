-- AlterTable
ALTER TABLE `AiJob` ADD COLUMN `userId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `AiJob_userId_idx` ON `AiJob`(`userId`);
