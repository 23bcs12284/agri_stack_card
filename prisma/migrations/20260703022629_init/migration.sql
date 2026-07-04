-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `phone` VARCHAR(191) NULL,
    `avatar` VARCHAR(191) NULL,
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `verificationToken` VARCHAR(191) NULL,
    `resetToken` VARCHAR(191) NULL,
    `resetTokenExpiry` DATETIME(3) NULL,
    `refreshToken` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `farmer_cards` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `farmerName` VARCHAR(191) NOT NULL,
    `hindiName` VARCHAR(191) NOT NULL DEFAULT '',
    `dob` VARCHAR(191) NOT NULL DEFAULT '',
    `gender` VARCHAR(191) NOT NULL DEFAULT '',
    `age` VARCHAR(191) NOT NULL DEFAULT '',
    `category` VARCHAR(191) NOT NULL DEFAULT 'General',
    `mobile` VARCHAR(191) NOT NULL DEFAULT '',
    `aadhaar` VARCHAR(191) NOT NULL DEFAULT '',
    `farmerId` VARCHAR(191) NOT NULL DEFAULT '',
    `enrollmentId` VARCHAR(191) NOT NULL DEFAULT '',
    `address` TEXT NOT NULL,
    `photo` TEXT NOT NULL,
    `qr` TEXT NOT NULL,
    `pdfPath` VARCHAR(191) NOT NULL DEFAULT '',
    `jsonData` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `farmer_cards_userId_idx`(`userId`),
    INDEX `farmer_cards_farmerId_idx`(`farmerId`),
    INDEX `farmer_cards_enrollmentId_idx`(`enrollmentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `land_records` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `farmerCardId` INTEGER NOT NULL,
    `state` VARCHAR(191) NOT NULL DEFAULT '',
    `district` VARCHAR(191) NOT NULL DEFAULT '',
    `subDistrict` VARCHAR(191) NOT NULL DEFAULT '',
    `village` VARCHAR(191) NOT NULL DEFAULT '',
    `surveyNumber` VARCHAR(191) NOT NULL DEFAULT '',
    `surveySubNumber` VARCHAR(191) NOT NULL DEFAULT '',
    `ownerName` VARCHAR(191) NOT NULL DEFAULT '',
    `identifierName` VARCHAR(191) NOT NULL DEFAULT '',
    `ownerType` VARCHAR(191) NOT NULL DEFAULT '',
    `shareType` VARCHAR(191) NOT NULL DEFAULT '',
    `totalArea` VARCHAR(191) NOT NULL DEFAULT '',
    `assignedArea` VARCHAR(191) NOT NULL DEFAULT '',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `land_records_farmerCardId_idx`(`farmerCardId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `farmer_cards` ADD CONSTRAINT `farmer_cards_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `land_records` ADD CONSTRAINT `land_records_farmerCardId_fkey` FOREIGN KEY (`farmerCardId`) REFERENCES `farmer_cards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
