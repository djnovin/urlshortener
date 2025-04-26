/*
  Warnings:

  - You are about to drop the column `city` on the `Click` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Click` table. All the data in the column will be lost.
  - You are about to drop the column `teamId` on the `Url` table. All the data in the column will be lost.
  - You are about to drop the column `updatedById` on the `Url` table. All the data in the column will be lost.
  - You are about to drop the `Team` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TeamMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UrlUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[shortUrl]` on the table `Url` will be added. If there are existing duplicate values, this will fail.
  - Made the column `ip` on table `Click` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userAgent` on table `Click` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMember" DROP CONSTRAINT "TeamMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "Url" DROP CONSTRAINT "Url_teamId_fkey";

-- DropForeignKey
ALTER TABLE "Url" DROP CONSTRAINT "Url_updatedById_fkey";

-- DropForeignKey
ALTER TABLE "UrlUser" DROP CONSTRAINT "UrlUser_urlId_fkey";

-- DropForeignKey
ALTER TABLE "UrlUser" DROP CONSTRAINT "UrlUser_userId_fkey";

-- AlterTable
ALTER TABLE "Click" DROP COLUMN "city",
DROP COLUMN "country",
ALTER COLUMN "ip" SET NOT NULL,
ALTER COLUMN "ip" SET DEFAULT '',
ALTER COLUMN "userAgent" SET NOT NULL,
ALTER COLUMN "userAgent" SET DEFAULT '';

-- AlterTable
ALTER TABLE "Url" DROP COLUMN "teamId",
DROP COLUMN "updatedById";

-- DropTable
DROP TABLE "Team";

-- DropTable
DROP TABLE "TeamMember";

-- DropTable
DROP TABLE "UrlUser";

-- DropEnum
DROP TYPE "TeamRole";

-- DropEnum
DROP TYPE "UserRole";

-- CreateIndex
CREATE INDEX "Click_urlId_idx" ON "Click"("urlId");

-- CreateIndex
CREATE UNIQUE INDEX "Url_shortUrl_key" ON "Url"("shortUrl");

-- CreateIndex
CREATE INDEX "Url_createdById_idx" ON "Url"("createdById");

-- CreateIndex
CREATE INDEX "Url_utmId_idx" ON "Url"("utmId");
