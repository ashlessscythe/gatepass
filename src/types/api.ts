import type { Gatepass } from "./gatepass";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface GatepassResponse extends ApiResponse<Gatepass> {}

export interface GatepassListResponse extends ApiResponse<Gatepass[]> {}

export interface GatepassCreateRequest {
  formNumber?: string;
  dateIn: string;
  timeIn: string;
  dateOut?: string | null;
  timeOut?: string | null;
  carrier: string;
  truckLicenseNo: string;
  truckNo: string;
  trailerLicenseNo?: string | null;
  trailerNo?: string | null;
  operatorName: string;
  passengerName?: string | null;
  purpose: "PICKUP" | "SERVICE" | "DELIVER" | "OTHER";
  sealed: boolean;
  sealNo1?: string | null;
  sealNo2?: string | null;
  remarks?: string | null;
  securityOfficer: string;
  releaseRemarks?: string | null;
  trailerType?: string | null;
  releaseTrailerNo?: string | null;
  destination?: string | null;
  vehicleInspected: boolean;
  releaseSealNo?: string | null;
  vestReturned: boolean;
  receiverSignature?: string | null;
  shipperSignature?: string | null;
  securitySignature?: string | null;
}

export interface GatepassUpdateRequest extends Partial<GatepassCreateRequest> {
  id: string;
}
