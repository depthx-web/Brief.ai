-- Team accounts: Team, TeamMember, TeamInvitation, TeamMemberSettings,
-- plus team_id/visibility on Project, plus a new EmailCampaign trigger
-- type for invitations. Team creation is gated on plan = 'PAID' in
-- application code (TeamController), not a DB constraint.

-- AlterTable
ALTER TABLE `EmailCampaign` MODIFY COLUMN `key` ENUM(
  'WELCOME',
  'UPGRADE',
  'WINBACK',
  'SECURITY',
  'RETENTION_WARNING',
  'SIGNUP_CONFIRMATION',
  'PAYMENT_RECEIPT',
  'PLAN_CHANGED',
  'CANCELLATION_CONFIRMATION',
  'REFERRAL_SUCCESS',
  'TEAM_INVITATION'
) NOT NULL;

-- CreateTable
CREATE TABLE `Team` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `ownerUserId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Team_ownerUserId_idx`(`ownerUserId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeamMember` (
    `id` VARCHAR(191) NOT NULL,
    `teamId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role` ENUM('OWNER', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    `status` ENUM('ACTIVE', 'INVITED') NOT NULL DEFAULT 'ACTIVE',
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `TeamMember_teamId_userId_key`(`teamId`, `userId`),
    INDEX `TeamMember_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeamInvitation` (
    `id` VARCHAR(191) NOT NULL,
    `teamId` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `invitedByUserId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TeamInvitation_token_key`(`token`),
    INDEX `TeamInvitation_teamId_idx`(`teamId`),
    INDEX `TeamInvitation_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TeamMemberSettings` (
    `id` VARCHAR(191) NOT NULL,
    `teamId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tokenBudgetOverride` INTEGER NULL,
    `canShareProjects` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `TeamMemberSettings_teamId_userId_key`(`teamId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `Project`
  ADD COLUMN `teamId` VARCHAR(191) NULL,
  ADD COLUMN `visibility` ENUM('PRIVATE', 'SHARED_WITH_TEAM') NOT NULL DEFAULT 'PRIVATE';

-- CreateIndex
CREATE INDEX `Project_teamId_idx` ON `Project`(`teamId`);

-- AddForeignKey
ALTER TABLE `Team` ADD CONSTRAINT `Team_ownerUserId_fkey` FOREIGN KEY (`ownerUserId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeamMember` ADD CONSTRAINT `TeamMember_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeamMember` ADD CONSTRAINT `TeamMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeamInvitation` ADD CONSTRAINT `TeamInvitation_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeamInvitation` ADD CONSTRAINT `TeamInvitation_invitedByUserId_fkey` FOREIGN KEY (`invitedByUserId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeamMemberSettings` ADD CONSTRAINT `TeamMemberSettings_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TeamMemberSettings` ADD CONSTRAINT `TeamMemberSettings_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Project` ADD CONSTRAINT `Project_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `Team`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO `EmailCampaign` (`id`, `key`, `enabled`, `subject`, `body`) VALUES
(UUID(), 'TEAM_INVITATION', true,
  'You&#39;ve been invited to join {{TEAM_NAME}} on Brief.ai',
  '<p>{{INVITER_NAME}} has invited you to join <strong>{{TEAM_NAME}}</strong> on Brief.ai.</p><p><a href="{{INVITE_URL}}">View invitation</a></p>');
