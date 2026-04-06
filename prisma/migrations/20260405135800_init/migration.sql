/*
  Warnings:

  - You are about to drop the column `ktpNumber` on the `KycSubmission` table. All the data in the column will be lost.
  - Added the required column `cityOrRegency` to the `KycSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `district` to the `KycSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fullName` to the `KycSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nik` to the `KycSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phoneNumber` to the `KycSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode` to the `KycSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `province` to the `KycSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rt` to the `KycSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rw` to the `KycSubmission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selfieImageUrl` to the `KycSubmission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "KycSubmission" DROP COLUMN "ktpNumber",
ADD COLUMN     "cityOrRegency" TEXT NOT NULL,
ADD COLUMN     "district" TEXT NOT NULL,
ADD COLUMN     "fullName" TEXT NOT NULL,
ADD COLUMN     "nik" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT NOT NULL,
ADD COLUMN     "postalCode" TEXT NOT NULL,
ADD COLUMN     "province" TEXT NOT NULL,
ADD COLUMN     "rt" TEXT NOT NULL,
ADD COLUMN     "rw" TEXT NOT NULL,
ADD COLUMN     "selfieImageUrl" TEXT NOT NULL;
