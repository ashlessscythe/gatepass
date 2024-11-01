"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "./FormField";
import { FormSelect } from "./FormSelect";
import { FormCheckbox } from "./FormCheckbox";
import { FormSignature } from "./FormSignature";
import { Toast } from "@/components/ui/toast";
import { GatepassPreview } from "@/components/gatepass/GatepassPreview";
import type { GatepassData } from "@/types/gatepass";
import { GatepassStatus } from "@prisma/client";
import {
  GatepassFormValues,
  gatepassFormSchema,
  defaultValues,
} from "@/lib/schemas/gatepass";
import { ToastProvider } from "@radix-ui/react-toast";

const purposeOptions = [
  { value: "PICKUP", label: "Pick up" },
  { value: "SERVICE", label: "Service" },
  { value: "DELIVER", label: "Deliver" },
  { value: "OTHER", label: "Other" },
];

export function GatepassForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(false);
  const [previewData, setPreviewData] = useState<GatepassData | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: "foreground" | "background";
  } | null>(null);

  const methods = useForm<GatepassFormValues>({
    resolver: zodResolver(gatepassFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: GatepassFormValues) => {
    if (preview) {
      setPreview(false);
      setPreviewData(null);
      return;
    }

    try {
      setLoading(true);

      // Include all form data including signatures
      const payload = {
        ...data,
        receiverSignature: data.receiverSignature || null,
        shipperSignature: data.shipperSignature || null,
        securitySignature: data.securitySignature || null,
      };

      const response = await fetch("/api/gatepass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to create gatepass");
      }

      setToast({
        message: "Gatepass created successfully",
        type: "foreground",
      });

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error("Error creating gatepass:", error);
      setToast({
        message: "Failed to create gatepass. Please try again.",
        type: "background",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    const isValid = await methods.trigger();
    if (isValid) {
      const formData = methods.getValues();
      const now = new Date().toISOString();

      const previewData: GatepassData = {
        ...formData,
        id: "preview",
        formNumber: formData.formNumber || null,
        status: GatepassStatus.PENDING,
        createdBy: null,
        updatedBy: null,
        createdAt: now,
        updatedAt: now,
        bolNumber: null,
        pickupDoor: null,
        yardCheckinTime: null,
        // Ensure all optional fields are properly nulled
        dateOut: formData.dateOut || null,
        timeOut: formData.timeOut || null,
        trailerLicenseNo: formData.trailerLicenseNo || null,
        trailerNo: formData.trailerNo || null,
        passengerName: formData.passengerName || null,
        sealNo1: formData.sealNo1 || null,
        sealNo2: formData.sealNo2 || null,
        remarks: formData.remarks || null,
        releaseRemarks: formData.releaseRemarks || null,
        trailerType: formData.trailerType || null,
        releaseTrailerNo: formData.releaseTrailerNo || null,
        destination: formData.destination || null,
        releaseSealNo: formData.releaseSealNo || null,
        receiverSignature: formData.receiverSignature || null,
        shipperSignature: formData.shipperSignature || null,
        securitySignature: formData.securitySignature || null,
      };

      setPreviewData(previewData);
      setPreview(true);
    }
  };

  if (preview && previewData) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-foreground">
            Preview Gate Pass
          </h2>
          <button
            onClick={() => {
              setPreview(false);
              setPreviewData(null);
            }}
            className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted"
          >
            Back to Edit
          </button>
        </div>
        <GatepassPreview data={previewData} />
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => {
              setPreview(false);
              setPreviewData(null);
            }}
            className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted"
          >
            Edit
          </button>
          <button
            onClick={methods.handleSubmit(onSubmit)}
            className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary border border-transparent rounded-md hover:bg-primary/90"
          >
            Confirm & Submit
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
          {/* Form sections with updated theme classes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Form fields */}
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Vehicle Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                name="carrier"
                label="Carrier"
                required
                placeholder="Enter carrier name"
              />
              <FormField
                name="truckLicenseNo"
                label="Truck License No."
                required
                placeholder="Enter truck license number"
              />
              <FormField
                name="truckNo"
                label="Truck No."
                required
                placeholder="Enter truck number"
              />
              <FormField
                name="trailerLicenseNo"
                label="Trailer License No."
                placeholder="Enter trailer license number"
              />
              <FormField
                name="trailerNo"
                label="Trailer No."
                placeholder="Enter trailer number"
              />
            </div>
          </div>

          {/* Personnel Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Personnel Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                name="operatorName"
                label="Operator Name"
                required
                placeholder="Enter operator name"
              />
              <FormField
                name="passengerName"
                label="Passenger Name"
                placeholder="Enter passenger name"
              />
              <FormField
                name="securityOfficer"
                label="Security Officer"
                required
                placeholder="Enter security officer name"
              />
            </div>
          </div>

          {/* Purpose and Sealing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Purpose and Sealing</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormSelect
                name="purpose"
                label="Purpose"
                options={purposeOptions}
                required
              />
              <div className="space-y-4">
                <FormCheckbox name="sealed" label="Sealed" />
                <FormField
                  name="sealNo1"
                  label="Seal No. 1"
                  placeholder="Enter seal number"
                />
                <FormField
                  name="sealNo2"
                  label="Seal No. 2"
                  placeholder="Enter secondary seal number"
                />
              </div>
              <div className="col-span-2">
                <FormField
                  name="remarks"
                  label="Remarks"
                  placeholder="Enter any remarks"
                />
              </div>
            </div>
          </div>

          {/* Release Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Release Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                name="releaseRemarks"
                label="Release Remarks"
                placeholder="Enter release remarks"
              />
              <FormField
                name="trailerType"
                label="Trailer Type"
                placeholder="Enter trailer type"
              />
              <FormField
                name="releaseTrailerNo"
                label="Release Trailer No."
                placeholder="Enter release trailer number"
              />
              <FormField
                name="destination"
                label="Destination"
                placeholder="Enter destination"
              />
              <FormField
                name="releaseSealNo"
                label="Release Seal No."
                placeholder="Enter release seal number"
              />
              <div className="space-y-4">
                <FormCheckbox
                  name="vehicleInspected"
                  label="Vehicle Inspected"
                />
                <FormCheckbox name="vestReturned" label="Vest Returned" />
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Signatures</h3>
            <div className="grid grid-cols-1 gap-8">
              <FormSignature
                name="receiverSignature"
                label="Receiver's Signature"
              />
              <FormSignature
                name="shipperSignature"
                label="Shipper's Signature"
              />
              <FormSignature
                name="securitySignature"
                label="Security Officer's Signature"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => methods.reset()}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handlePreview}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted disabled:opacity-50"
            >
              Preview
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary border border-transparent rounded-md hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Submit"}
            </button>
          </div>
        </form>
      </FormProvider>
      <ToastProvider>
        {toast && <Toast title={toast.message} type={toast.type} />}
      </ToastProvider>
    </>
  );
}
