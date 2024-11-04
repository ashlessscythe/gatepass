/*
  Warnings:

  - The values [DOCUMENTS_TRANSFERRED,SEALED] on the enum `GatepassStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GatepassStatus_new" AS ENUM ('PENDING', 'BOL_VERIFIED', 'IN_YARD', 'CHECKED_IN', 'LOADING', 'COMPLETED', 'CANCELLED');
ALTER TABLE "Gatepass" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Gatepass" ALTER COLUMN "status" TYPE "GatepassStatus_new" USING ("status"::text::"GatepassStatus_new");
ALTER TYPE "GatepassStatus" RENAME TO "GatepassStatus_old";
ALTER TYPE "GatepassStatus_new" RENAME TO "GatepassStatus";
DROP TYPE "GatepassStatus_old";
ALTER TABLE "Gatepass" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "Gatepass" ALTER COLUMN "sealed" SET DEFAULT false,
ALTER COLUMN "vehicleInspected" SET DEFAULT false,
ALTER COLUMN "vestReturned" SET DEFAULT false;
