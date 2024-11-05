import { GatepassStatus } from "@prisma/client";

// Define valid status transitions
const validTransitions: Record<GatepassStatus, GatepassStatus[]> = {
  PENDING: [GatepassStatus.BOL_VERIFIED, GatepassStatus.CANCELLED],
  BOL_VERIFIED: [GatepassStatus.CHECKED_IN, GatepassStatus.CANCELLED],
  CHECKED_IN: [GatepassStatus.IN_YARD, GatepassStatus.CANCELLED],
  IN_YARD: [GatepassStatus.AT_DOOR, GatepassStatus.CANCELLED],
  AT_DOOR: [GatepassStatus.LOADING, GatepassStatus.CANCELLED],
  LOADING: [
    GatepassStatus.AWAITING_SEAL,
    GatepassStatus.AWAITING_DOCS,
    GatepassStatus.CANCELLED,
  ],
  AWAITING_SEAL: [
    GatepassStatus.DOCS_TRANSFERRED,
    GatepassStatus.COMPLETED,
    GatepassStatus.CANCELLED,
  ],
  AWAITING_DOCS: [
    GatepassStatus.DOCS_TRANSFERRED,
    GatepassStatus.COMPLETED,
    GatepassStatus.CANCELLED,
  ],
  DOCS_TRANSFERRED: [GatepassStatus.COMPLETED, GatepassStatus.CANCELLED],
  COMPLETED: [GatepassStatus.EXITED, GatepassStatus.CANCELLED],
  EXITED: [GatepassStatus.CANCELLED],
  CANCELLED: [], // Terminal state
};

// Check if a status transition is valid
export function isValidTransition(
  currentStatus: GatepassStatus,
  newStatus: GatepassStatus
): boolean {
  // Allow transition to same status
  if (currentStatus === newStatus) {
    return true;
  }

  // Check if the transition is valid
  return validTransitions[currentStatus]?.includes(newStatus) ?? false;
}

// Get next status based on action
export function getStatusFromAction(
  action:
    | "VERIFY_BOL"
    | "CHECK_IN"
    | "ASSIGN_DOOR"
    | "START_LOADING"
    | "ASSIGN_SEAL"
    | "TRANSFER_DOCS",
  currentStatus: GatepassStatus
): GatepassStatus | null {
  switch (action) {
    case "VERIFY_BOL":
      return currentStatus === GatepassStatus.PENDING
        ? GatepassStatus.BOL_VERIFIED
        : null;

    case "CHECK_IN":
      return currentStatus === GatepassStatus.BOL_VERIFIED
        ? GatepassStatus.CHECKED_IN
        : null;

    case "ASSIGN_DOOR":
      return currentStatus === GatepassStatus.IN_YARD
        ? GatepassStatus.AT_DOOR
        : null;

    case "START_LOADING":
      return currentStatus === GatepassStatus.AT_DOOR
        ? GatepassStatus.LOADING
        : null;

    case "ASSIGN_SEAL":
      return currentStatus === GatepassStatus.LOADING
        ? GatepassStatus.AWAITING_DOCS
        : null;

    case "TRANSFER_DOCS":
      return currentStatus === GatepassStatus.AWAITING_DOCS
        ? GatepassStatus.DOCS_TRANSFERRED
        : null;

    default:
      return null;
  }
}

// Get available status transitions
export function getAvailableTransitions(
  currentStatus: GatepassStatus
): GatepassStatus[] {
  return validTransitions[currentStatus] || [];
}

// Get status display name
export function getStatusDisplayName(status: GatepassStatus): string {
  return status
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

interface StatusConditions {
  hasSeals: boolean;
  hasDocuments: boolean;
  hasSignatures: boolean;
}

// Check if status requires specific conditions
export function statusRequiresConditions(
  currentStatus: GatepassStatus,
  newStatus: GatepassStatus,
  conditions: StatusConditions
): boolean {
  // Special conditions for specific transitions
  if (newStatus === GatepassStatus.COMPLETED) {
    // Check if all required conditions are met
    if (currentStatus === GatepassStatus.DOCS_TRANSFERRED) {
      return (
        conditions.hasSeals &&
        conditions.hasDocuments &&
        conditions.hasSignatures
      );
    }
  }

  // No special conditions for this transition
  return true;
}
