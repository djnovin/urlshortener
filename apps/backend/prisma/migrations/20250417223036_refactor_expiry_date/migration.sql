/*
  Warnings:

  - You are about to drop the column `expirationDate` on the `Url` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Url" DROP COLUMN "expirationDate",
ADD COLUMN     "expiredAt" TIMESTAMP(3);
