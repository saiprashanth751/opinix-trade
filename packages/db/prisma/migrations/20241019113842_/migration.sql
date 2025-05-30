/*
  Warnings:

  - A unique constraint covering the columns `[eventId]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `eventId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "eventId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Event_eventId_key" ON "Event"("eventId");
