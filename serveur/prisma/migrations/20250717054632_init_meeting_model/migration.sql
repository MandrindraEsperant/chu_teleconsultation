-- CreateEnum
CREATE TYPE "ReminderType" AS ENUM ('AT_TIME', 'FIVE_MINUTES', 'TEN_MINUTES', 'FIFTEEN_MINUTES', 'THIRTY_MINUTES', 'ONE_HOUR', 'TWO_HOURS', 'ONE_DAY', 'TWO_DAYS');

-- CreateEnum
CREATE TYPE "MeetingStatus" AS ENUM ('SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- AlterTable
ALTER TABLE "app_user" ADD COLUMN     "image_link" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "name" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "meeting" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "reminder" "ReminderType",
    "uniqueCode" TEXT NOT NULL,
    "meetingLink" TEXT NOT NULL,
    "status" "MeetingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hostId" INTEGER NOT NULL,

    CONSTRAINT "meeting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "meeting_uniqueCode_key" ON "meeting"("uniqueCode");

-- AddForeignKey
ALTER TABLE "meeting" ADD CONSTRAINT "meeting_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "app_user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
