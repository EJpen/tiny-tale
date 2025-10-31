/*
  Warnings:

  - You are about to drop the column `room_name` on the `rooms` table. All the data in the column will be lost.
  - You are about to drop the column `trustee_id` on the `rooms` table. All the data in the column will be lost.
  - You are about to drop the column `is_out` on the `votes` table. All the data in the column will be lost.
  - You are about to drop the column `room_id` on the `votes` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `votes` table. All the data in the column will be lost.
  - Added the required column `roomName` to the `rooms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trusteeId` to the `rooms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `votes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomId` to the `votes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."rooms" DROP CONSTRAINT "rooms_trustee_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."votes" DROP CONSTRAINT "votes_room_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."votes" DROP CONSTRAINT "votes_user_id_fkey";

-- AlterTable
ALTER TABLE "rooms" DROP COLUMN "room_name",
DROP COLUMN "trustee_id",
ADD COLUMN     "roomName" TEXT NOT NULL,
ADD COLUMN     "trusteeId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "votes" DROP COLUMN "is_out",
DROP COLUMN "room_id",
DROP COLUMN "user_id",
ADD COLUMN     "isOut" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "roomId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "rooms" ADD CONSTRAINT "rooms_trusteeId_fkey" FOREIGN KEY ("trusteeId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
