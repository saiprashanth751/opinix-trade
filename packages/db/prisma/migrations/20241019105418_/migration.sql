/*
  Warnings:

  - You are about to alter the column `balance` on the `User` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to drop the `NoOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderBook` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Trade` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `YesOrder` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `end_date` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expiresAt` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `max_bet` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `min_bet` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `slug` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sot` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start_date` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TradeStatus" AS ENUM ('ACTIVE', 'PAST');

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_adminId_fkey";

-- DropForeignKey
ALTER TABLE "NoOrder" DROP CONSTRAINT "NoOrder_orderBookId_fkey";

-- DropForeignKey
ALTER TABLE "OrderBook" DROP CONSTRAINT "OrderBook_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Trade" DROP CONSTRAINT "Trade_portfolioId_fkey";

-- DropForeignKey
ALTER TABLE "YesOrder" DROP CONSTRAINT "YesOrder_orderBookId_fkey";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "end_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "max_bet" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "min_bet" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL,
ADD COLUMN     "slug" TEXT NOT NULL,
ADD COLUMN     "sot" TEXT NOT NULL,
ADD COLUMN     "start_date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "balance" SET DEFAULT 0,
ALTER COLUMN "balance" SET DATA TYPE INTEGER,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "NoOrder";

-- DropTable
DROP TABLE "OrderBook";

-- DropTable
DROP TABLE "Trade";

-- DropTable
DROP TABLE "YesOrder";

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
