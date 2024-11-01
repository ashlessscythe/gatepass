import type { User } from "./auth";
import type { GatepassStatus as PrismaGatepassStatus } from "@prisma/client";

// Re-export Prisma's GatepassStatus enum
export { GatepassStatus } from "@prisma/client";

export interface GatepassData {
  id: string;
  formNumber: string | null;
  dateIn: string;
  timeIn: string;
  dateOut: string | null;
  timeOut: string | null;
  carrier: string;
  truckLicenseNo: string;
  truckNo: string;
  trailerLicenseNo: string | null;
  trailerNo: string | null;
  operatorName: string;
  passengerName: string | null;
  purpose: "PICKUP" | "SERVICE" | "DELIVER" | "OTHER";
  sealed: boolean;
  sealNo1: string | null;
  sealNo2: string | null;
  remarks: string | null;
  securityOfficer: string;
  releaseRemarks: string | null;
  trailerType: string | null;
  releaseTrailerNo: string | null;
  destination: string | null;
  vehicleInspected: boolean;
  releaseSealNo: string | null;
  vestReturned: boolean;
  receiverSignature: string | null;
  shipperSignature: string | null;
  securitySignature: string | null;
  status: PrismaGatepassStatus;
  createdBy: { name: string | null } | null;
  updatedBy: { name: string | null } | null;
  createdAt: string;
  updatedAt: string;
  bolNumber: string | null;
  pickupDoor: string | null;
  yardCheckinTime: string | null;
}

export interface GatepassTableData {
  gatepasses: Array<
    Pick<
      GatepassData,
      | "id"
      | "formNumber"
      | "dateIn"
      | "carrier"
      | "truckNo"
      | "operatorName"
      | "status"
      | "createdBy"
      | "createdAt"
    >
  >;
  total: number;
  pages: number;
}
