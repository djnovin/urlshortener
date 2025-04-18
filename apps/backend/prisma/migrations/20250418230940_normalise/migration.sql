/*
  Warnings:

  - You are about to drop the column `userId` on the `Url` table. All the data in the column will be lost.
  - You are about to drop the `_UserUrls` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Url" DROP CONSTRAINT "Url_userId_fkey";

-- DropForeignKey
ALTER TABLE "_UserUrls" DROP CONSTRAINT "_UserUrls_A_fkey";

-- DropForeignKey
ALTER TABLE "_UserUrls" DROP CONSTRAINT "_UserUrls_B_fkey";

-- AlterTable
ALTER TABLE "Url" DROP COLUMN "userId";

-- DropTable
DROP TABLE "_UserUrls";
