/*
  Warnings:

  - The `status` column on the `Gatepass` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[formNumber]` on the table `Gatepass` will be added. If there are existing duplicate values, this will fail.
  - Made the column `createdById` on table `Gatepass` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "GatepassStatus" AS ENUM ('PENDING', 'BOL_VERIFIED', 'IN_YARD', 'LOADING', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Gatepass" DROP CONSTRAINT "Gatepass_createdById_fkey";

-- AlterTable
ALTER TABLE "Gatepass" ADD COLUMN     "bolNumber" TEXT,
ADD COLUMN     "pickupDoor" TEXT,
ADD COLUMN     "yardCheckinTime" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "GatepassStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "createdById" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAt",
DROP COLUMN "password",
DROP COLUMN "updatedAt",
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;

-- DropEnum
DROP TYPE "Status";

-- CreateIndex
CREATE UNIQUE INDEX "Gatepass_formNumber_key" ON "Gatepass"("formNumber");

-- AddForeignKey
ALTER TABLE "Gatepass" ADD CONSTRAINT "Gatepass_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
