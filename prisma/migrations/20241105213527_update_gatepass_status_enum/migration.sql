-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "GatepassStatus" ADD VALUE 'AT_DOOR';
ALTER TYPE "GatepassStatus" ADD VALUE 'AWAITING_SEAL';
ALTER TYPE "GatepassStatus" ADD VALUE 'AWAITING_DOCS';
ALTER TYPE "GatepassStatus" ADD VALUE 'DOCS_TRANSFERRED';
ALTER TYPE "GatepassStatus" ADD VALUE 'EXITED';
