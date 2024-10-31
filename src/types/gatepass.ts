import { Status } from "@prisma/client";

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
  purpose: string;
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
  status: Status;
  createdBy: { name: string } | null;
  updatedBy: { name: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface GatepassPreviewProps {
  data: GatepassData;
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
