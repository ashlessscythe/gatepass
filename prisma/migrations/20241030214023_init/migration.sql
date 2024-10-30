-- CreateEnum
CREATE TYPE "Purpose" AS ENUM ('PICKUP', 'SERVICE', 'DELIVER', 'OTHER');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('GUARD', 'DISPATCH', 'WAREHOUSE', 'ADMIN');

-- CreateTable
CREATE TABLE "Gatepass" (
    "id" TEXT NOT NULL,
    "formNumber" TEXT,
    "dateIn" TIMESTAMP(3) NOT NULL,
    "timeIn" TIMESTAMP(3) NOT NULL,
    "dateOut" TIMESTAMP(3),
    "timeOut" TIMESTAMP(3),
    "carrier" TEXT NOT NULL,
    "truckLicenseNo" TEXT NOT NULL,
    "truckNo" TEXT NOT NULL,
    "trailerLicenseNo" TEXT,
    "trailerNo" TEXT,
    "operatorName" TEXT NOT NULL,
    "passengerName" TEXT,
    "purpose" "Purpose" NOT NULL,
    "sealed" BOOLEAN NOT NULL,
    "sealNo1" TEXT,
    "sealNo2" TEXT,
    "remarks" TEXT,
    "securityOfficer" TEXT NOT NULL,
    "releaseRemarks" TEXT,
    "trailerType" TEXT,
    "releaseTrailerNo" TEXT,
    "destination" TEXT,
    "vehicleInspected" BOOLEAN NOT NULL,
    "releaseSealNo" TEXT,
    "vestReturned" BOOLEAN NOT NULL,
    "receiverSignature" TEXT,
    "shipperSignature" TEXT,
    "securitySignature" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Gatepass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Gatepass_formNumber_idx" ON "Gatepass"("formNumber");

-- CreateIndex
CREATE INDEX "Gatepass_dateIn_idx" ON "Gatepass"("dateIn");

-- CreateIndex
CREATE INDEX "Gatepass_carrier_idx" ON "Gatepass"("carrier");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
