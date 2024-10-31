import { z } from "zod";

export const gatepassFormSchema = z.object({
  // Basic Information
  formNumber: z.string().optional(),
  dateIn: z.string(),
  timeIn: z.string(),
  dateOut: z.string().optional(),
  timeOut: z.string().optional(),

  // Vehicle Information
  carrier: z.string().min(1, "Carrier name is required"),
  truckLicenseNo: z.string().min(1, "Truck license number is required"),
  truckNo: z.string().min(1, "Truck number is required"),
  trailerLicenseNo: z.string().optional(),
  trailerNo: z.string().optional(),

  // Personnel Information
  operatorName: z.string().min(1, "Operator name is required"),
  passengerName: z.string().optional(),

  // Purpose and Sealing
  purpose: z.enum(["PICKUP", "SERVICE", "DELIVER", "OTHER"]),
  sealed: z.boolean(),
  sealNo1: z.string().optional(),
  sealNo2: z.string().optional(),
  remarks: z.string().optional(),
  securityOfficer: z.string().min(1, "Security officer name is required"),

  // Release Information
  releaseRemarks: z.string().optional(),
  trailerType: z.string().optional(),
  releaseTrailerNo: z.string().optional(),
  destination: z.string().optional(),
  vehicleInspected: z.boolean(),
  releaseSealNo: z.string().optional(),
  vestReturned: z.boolean(),
});

export type GatepassFormValues = z.infer<typeof gatepassFormSchema>;

export const defaultValues: Partial<GatepassFormValues> = {
  sealed: false,
  vehicleInspected: false,
  vestReturned: false,
  purpose: "PICKUP",
  dateIn: new Date().toISOString().split("T")[0],
  timeIn: new Date().toTimeString().split(" ")[0].slice(0, 5),
};
