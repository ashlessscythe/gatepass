-- Simplify workflow statuses: Remove IN_YARD, CHECKED_IN, AWAITING_SEAL, DOCS_TRANSFERRED
-- Map existing data to new simplified statuses

-- First, update existing records to new statuses
UPDATE "Gatepass"
SET status = CASE
  -- CHECKED_IN is redundant with BOL_VERIFIED (driver checked in when BOL verified)
  WHEN status = 'CHECKED_IN' THEN 'BOL_VERIFIED'::"GatepassStatus"
  
  -- IN_YARD: if door assigned, move to AT_DOOR, otherwise back to BOL_VERIFIED
  WHEN status = 'IN_YARD' AND "pickupDoor" IS NOT NULL THEN 'AT_DOOR'::"GatepassStatus"
  WHEN status = 'IN_YARD' THEN 'BOL_VERIFIED'::"GatepassStatus"
  
  -- AWAITING_SEAL becomes AWAITING_DOCS (seals assigned during this phase)
  WHEN status = 'AWAITING_SEAL' THEN 'AWAITING_DOCS'::"GatepassStatus"
  
  -- DOCS_TRANSFERRED becomes COMPLETED (docs transferred means complete)
  WHEN status = 'DOCS_TRANSFERRED' THEN 'COMPLETED'::"GatepassStatus"
  
  -- Keep all other statuses as-is
  ELSE status
END;

-- Now update the enum type
BEGIN;
  -- Create new enum without the removed values
  CREATE TYPE "GatepassStatus_new" AS ENUM (
    'PENDING',
    'BOL_VERIFIED',
    'AT_DOOR',
    'LOADING',
    'AWAITING_DOCS',
    'COMPLETED',
    'EXITED',
    'CANCELLED'
  );

  -- Update the column to use new enum
  ALTER TABLE "Gatepass" 
    ALTER COLUMN "status" DROP DEFAULT,
    ALTER COLUMN "status" TYPE "GatepassStatus_new" 
    USING "status"::text::"GatepassStatus_new";

  -- Set default back
  ALTER TABLE "Gatepass" 
    ALTER COLUMN "status" SET DEFAULT 'PENDING'::"GatepassStatus_new";

  -- Drop old enum and rename new one
  DROP TYPE "GatepassStatus";
  ALTER TYPE "GatepassStatus_new" RENAME TO "GatepassStatus";
COMMIT;

