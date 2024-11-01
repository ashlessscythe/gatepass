"use client";

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { FormField } from "./FormField";
import { FormSelect } from "./FormSelect";
import { FormCheckbox } from "./FormCheckbox";
import { FormSignature } from "./FormSignature";
import { useToast } from "@/hooks/use-toast";
import { GatepassPreview } from "@/components/gatepass/GatepassPreview";
import type { Gatepass } from "@/types/gatepass";
import { GatepassStatus, Purpose } from "@prisma/client";
import {
  GatepassFormValues,
  gatepassFormSchema,
  defaultValues,
} from "@/lib/schemas/gatepass";
import { useRouter } from "next/navigation";

interface GatepassFormProps {
  onSuccess?: (data: Gatepass) => void;
  initialData?: Partial<GatepassFormValues>;
}

const purposeOptions = [
  { value: Purpose.PICKUP, label: "Pick up" },
  { value: Purpose.SERVICE, label: "Service" },
  { value: Purpose.DELIVER, label: "Deliver" },
  { value: Purpose.OTHER, label: "Other" },
];

export function GatepassForm({ onSuccess, initialData }: GatepassFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<GatepassFormValues>({
    resolver: zodResolver(gatepassFormSchema),
    defaultValues: {
      ...defaultValues,
      ...initialData,
    },
  });

  const { handleSubmit, watch, formState } = form;
  const formData = watch();
  const { isSubmitting } = formState;

  const onSubmit = async (data: GatepassFormValues) => {
    try {
      // Log form data before submission
      console.log("[GatepassForm] Submitting form data:", {
        ...data,
        receiverSignature: data.receiverSignature
          ? `${Math.round((data.receiverSignature as string).length / 1024)}KB`
          : "null",
        shipperSignature: data.shipperSignature
          ? `${Math.round((data.shipperSignature as string).length / 1024)}KB`
          : "null",
        securitySignature: data.securitySignature
          ? `${Math.round((data.securitySignature as string).length / 1024)}KB`
          : "null",
      });

      const response = await fetch("/api/gatepass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          sealNo1: data.sealNo1 || null,
          sealNo2: data.sealNo2 || null,
          remarks: data.remarks || null,
          releaseRemarks: data.releaseRemarks || null,
          trailerType: data.trailerType || null,
          releaseTrailerNo: data.releaseTrailerNo || null,
          destination: data.destination || null,
          releaseSealNo: data.releaseSealNo || null,
          trailerLicenseNo: data.trailerLicenseNo || null,
          trailerNo: data.trailerNo || null,
          passengerName: data.passengerName || null,
          status: GatepassStatus.PENDING,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create gatepass");
      }

      const gatepass = await response.json();
      console.log("[GatepassForm] Gatepass created successfully:", gatepass.id);

      toast({
        title: "Success",
        description: "Gatepass created successfully",
      });

      if (onSuccess) {
        onSuccess(gatepass);
      } else {
        router.push(`/gatepass/${gatepass.id}`);
      }
    } catch (error) {
      console.error("[GatepassForm] Error creating gatepass:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create gatepass",
        variant: "destructive",
      });
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <FormField
                name="carrier"
                label="Carrier"
                placeholder="Enter carrier name"
                required
              />
              <FormField
                name="truckLicenseNo"
                label="License No. Truck"
                placeholder="Enter truck license number"
                required
              />
              <FormField
                name="truckNo"
                label="Truck No."
                placeholder="Enter truck number"
                required
              />
              <FormField
                name="trailerLicenseNo"
                label="License No. Trailer"
                placeholder="Enter trailer license number"
              />
              <FormField
                name="trailerNo"
                label="Trailer No."
                placeholder="Enter trailer number"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personnel</h3>
              <FormField
                name="operatorName"
                label="Name of Operator"
                placeholder="Enter operator name"
                required
              />
              <FormField
                name="passengerName"
                label="Name of Passenger"
                placeholder="Enter passenger name"
              />
              <FormField
                name="securityOfficer"
                label="Security Officer"
                placeholder="Enter security officer name"
                required
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Purpose & Status</h3>
              <FormSelect
                name="purpose"
                label="Purpose"
                options={purposeOptions}
                required
              />
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
              <FormField
                name="remarks"
                label="Remarks"
                placeholder="Enter remarks"
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Release Information</h3>
              <FormField
                name="releaseRemarks"
                label="Release Pass Remarks"
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
              <FormCheckbox name="vehicleInspected" label="Vehicle Inspected" />
              <FormField
                name="releaseSealNo"
                label="Release Seal No."
                placeholder="Enter release seal number"
              />
              <FormCheckbox name="vestReturned" label="Vest Returned" />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Signatures</h3>
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

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Preview</h3>
            <GatepassPreview data={formData as any} />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Gatepass"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
