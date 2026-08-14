-- CreateTable
CREATE TABLE `PasswordJob` (
    `id` VARCHAR(191) NOT NULL,
    `originalFilename` VARCHAR(191) NOT NULL,
    `operation` ENUM('PROTECT', 'UNLOCK') NOT NULL,
    `status` ENUM('PROCESSING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PROCESSING',
    `errorMessage` TEXT NULL,
    `durationMs` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
