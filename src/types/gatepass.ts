import type {
  Gatepass as PrismaGatepass,
  GatepassStatus,
} from "@prisma/client";

// Re-export Prisma's GatepassStatus enum
export { GatepassStatus } from "@prisma/client";

// Extended Gatepass type that includes relations
export interface Gatepass extends PrismaGatepass {
  createdBy?: {
    name: string | null;
  } | null;
  updatedBy?: {
    name: string | null;
  } | null;
}

// Type for table display items (subset of Gatepass)
export interface GatepassTableItem {
  id: string;
  formNumber: string | null;
  dateIn: string;
  carrier: string;
  truckNo: string;
  operatorName: string;
  status: GatepassStatus;
  createdBy: { name: string | null } | null;
  createdAt: string;
}

export interface GatepassTableData {
  gatepasses: GatepassTableItem[];
  total: number;
  pages: number;
}

export interface GatepassTableProps {
  initialData: GatepassTableData;
}

// Types for warehouse operations
export interface PendingDocument {
  id: string;
  formNumber: string | null;
  carrier: string;
  operatorName: string;
  status: GatepassStatus;
  createdAt: string;
}

export interface SealAssignmentData {
  gatepassId: string;
  sealNumber: string;
}

export interface DocumentTransferData {
  gatepassId: string;
}

// Type for signature update
export interface SignatureUpdateData {
  gatepassId: string;
  signature: string;
}
