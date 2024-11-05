"use client";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormSignature } from "@/components/forms/FormSignature";
import { GatepassStatus } from "@prisma/client";

interface ExitVerificationProps {
  gatepass: {
    id: string;
    formNumber: string | null;
    truckLicenseNo: string;
    trailerLicenseNo: string | null;
    trailerNo: string | null;
    sealed: boolean;
    sealNo1: string | null;
    sealNo2: string | null;
    status: GatepassStatus;
  };
  onVerify: () => void;
}

interface FormData {
  truckLicenseNo: string;
  trailerLicenseNo: string;
  trailerNo: string;
  sealNo1: string;
  sealNo2: string;
  securitySignature: string;
}

export function ExitVerification({
  gatepass,
  onVerify,
}: ExitVerificationProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const methods = useForm<FormData>({
    defaultValues: {
      truckLicenseNo: "",
      trailerLicenseNo: "",
      trailerNo: "",
      sealNo1: "",
      sealNo2: "",
      securitySignature: "",
    },
  });

  const handleVerify = async (data: FormData) => {
    setLoading(true);

    try {
      // Verify truck and trailer details match
      if (data.truckLicenseNo !== gatepass.truckLicenseNo) {
        throw new Error("Truck license number does not match");
      }

      if (
        gatepass.trailerLicenseNo &&
        data.trailerLicenseNo !== gatepass.trailerLicenseNo
      ) {
        throw new Error("Trailer license number does not match");
      }

      if (gatepass.trailerNo && data.trailerNo !== gatepass.trailerNo) {
        throw new Error("Trailer number does not match");
      }

      // Verify seals if required
      if (gatepass.sealed) {
        if (gatepass.sealNo1 && data.sealNo1 !== gatepass.sealNo1) {
          throw new Error("Seal number 1 does not match");
        }
        if (gatepass.sealNo2 && data.sealNo2 !== gatepass.sealNo2) {
          throw new Error("Seal number 2 does not match");
        }
      }

      // Verify signature is provided
      if (!data.securitySignature) {
        throw new Error("Security signature is required");
      }

      const response = await fetch(
        `/api/guard/gatepasses/${gatepass.id}/exit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            securitySignature: data.securitySignature,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error);
      }

      toast({
        title: "Success",
        description: "Exit verification completed successfully",
      });

      onVerify();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Verification failed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exit Verification</CardTitle>
        <CardDescription>
          Verify vehicle and seal details before exit
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(handleVerify)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="truckLicenseNo">Truck License Number</label>
                <Input
                  id="truckLicenseNo"
                  {...methods.register("truckLicenseNo", { required: true })}
                />
              </div>
              {gatepass.trailerLicenseNo && (
                <div className="space-y-2">
                  <label htmlFor="trailerLicenseNo">
                    Trailer License Number
                  </label>
                  <Input
                    id="trailerLicenseNo"
                    {...methods.register("trailerLicenseNo", {
                      required: true,
                    })}
                  />
                </div>
              )}
              {gatepass.trailerNo && (
                <div className="space-y-2">
                  <label htmlFor="trailerNo">Trailer Number</label>
                  <Input
                    id="trailerNo"
                    {...methods.register("trailerNo", { required: true })}
                  />
                </div>
              )}
              {gatepass.sealed && gatepass.sealNo1 && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="sealNo1">Seal Number 1</label>
                    <Input
                      id="sealNo1"
                      {...methods.register("sealNo1", { required: true })}
                    />
                  </div>
                  {gatepass.sealNo2 && (
                    <div className="space-y-2">
                      <label htmlFor="sealNo2">Seal Number 2</label>
                      <Input
                        id="sealNo2"
                        {...methods.register("sealNo2", { required: true })}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="space-y-2">
              <FormSignature
                name="securitySignature"
                label="Security Officer Signature"
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Complete Exit Verification"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
