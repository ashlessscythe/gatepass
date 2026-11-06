-- New enum values cannot be used in the same transaction that adds them,
-- so the column default is changed in the next migration.
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'PENDING';
