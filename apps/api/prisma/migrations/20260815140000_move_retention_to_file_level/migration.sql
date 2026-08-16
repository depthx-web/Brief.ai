-- Fix (Batch 5, Part 8): retention moves from the project as a whole to
-- each file within it — a long-running project shouldn't be deleted
-- entirely because one old file in it expired while the rest are recent.

-- AlterTable
ALTER TABLE `LibraryDocument` ADD COLUMN `expiresAt` DATETIME(3) NULL;

-- Backfill: existing documents inherit their project's current expiry so no
-- active retention window silently disappears for this migration.
UPDATE `LibraryDocument` ld
JOIN `Project` p ON ld.projectId = p.id
SET ld.expiresAt = p.expiresAt
WHERE ld.projectId IS NOT NULL;

-- CreateIndex
CREATE INDEX `LibraryDocument_expiresAt_idx` ON `LibraryDocument`(`expiresAt`);

-- DropIndex
DROP INDEX `Project_expiresAt_idx` ON `Project`;

-- AlterTable
ALTER TABLE `Project` DROP COLUMN `expiresAt`;
