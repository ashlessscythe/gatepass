"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormField } from "./FormField";
import { FormSelect } from "./FormSelect";
import { FormCheckbox } from "./FormCheckbox";
import { Toast } from "@/components/ui/toast";
import {
  GatepassFormValues,
  gatepassFormSchema,
  defaultValues,
} from "@/lib/schemas/gatepass";

const purposeOptions = [
  { value: "PICKUP", label: "Pick up" },
  { value: "SERVICE", label: "Service" },
  { value: "DELIVER", label: "Deliver" },
  { value: "OTHER", label: "Other" },
];

export function GatepassForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const methods = useForm<GatepassFormValues>({
    resolver: zodResolver(gatepassFormSchema),
    defaultValues,
  });

  const onSubmit = async (data: GatepassFormValues) => {
    try {
      setLoading(true);
      const response = await fetch("/api/gatepass", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create gatepass");
      }

      setToast({
        message: "Gatepass created successfully",
        type: "success",
      });

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 2000);
    } catch (error) {
      console.error("Error creating gatepass:", error);
      setToast({
        message: "Failed to create gatepass. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
          {/* Form fields remain the same */}
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField name="formNumber" label="Form Number" />
              <FormField name="dateIn" label="Date In" type="date" required />
              <FormField name="timeIn" label="Time In" type="time" required />
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

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => methods.reset()}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? "Creating..." : "Submit"}
            </button>
          </div>
        </form>
      </FormProvider>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
