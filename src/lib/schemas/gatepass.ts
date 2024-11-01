import { z } from "zod";
import { Purpose } from "@prisma/client";

export const gatepassFormSchema = z.object({
  // Basic Information
  formNumber: z.string().optional().nullable(),
  dateIn: z.string(),
  timeIn: z.string(),
  dateOut: z.string().optional().nullable(),
  timeOut: z.string().optional().nullable(),

  // Vehicle Information
  carrier: z.string().min(1, "Carrier name is required"),
  truckLicenseNo: z.string().min(1, "Truck license number is required"),
  truckNo: z.string().min(1, "Truck number is required"),
  trailerLicenseNo: z.string().optional().nullable(),
  trailerNo: z.string().optional().nullable(),

  // Personnel Information
  operatorName: z.string().min(1, "Operator name is required"),
  passengerName: z.string().optional().nullable(),

  // Purpose and Sealing
  purpose: z.nativeEnum(Purpose),
  sealed: z.boolean(),
  sealNo1: z.string().optional().nullable(),
  sealNo2: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
  securityOfficer: z.string().min(1, "Security officer name is required"),

  // Release Information
  releaseRemarks: z.string().optional().nullable(),
  trailerType: z.string().optional().nullable(),
  releaseTrailerNo: z.string().optional().nullable(),
  destination: z.string().optional().nullable(),
  vehicleInspected: z.boolean(),
  releaseSealNo: z.string().optional().nullable(),
  vestReturned: z.boolean(),

  // Signatures
  receiverSignature: z.string().nullable(),
  shipperSignature: z.string().nullable(),
  securitySignature: z.string().nullable(),
});

export type GatepassFormValues = z.infer<typeof gatepassFormSchema>;

export const defaultValues: Partial<GatepassFormValues> = {
  sealed: false,
  vehicleInspected: false,
  vestReturned: false,
  purpose: Purpose.PICKUP,
  dateIn: new Date().toISOString().split("T")[0],
  timeIn: new Date().toTimeString().split(" ")[0].slice(0, 5),
  receiverSignature: null,
  shipperSignature: null,
  securitySignature: null,
  trailerLicenseNo: null,
  trailerNo: null,
  passengerName: null,
  sealNo1: null,
  sealNo2: null,
  remarks: null,
  releaseRemarks: null,
  trailerType: null,
  releaseTrailerNo: null,
  destination: null,
  releaseSealNo: null,
};
