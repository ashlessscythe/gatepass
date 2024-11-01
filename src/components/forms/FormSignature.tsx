"use client";

import { SignaturePad } from "@/components/signature/SignaturePad";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";
import { useEffect } from "react";

interface FormSignatureProps {
  name: string;
  label: string;
  required?: boolean;
}

export function FormSignature({
  name,
  label,
  required = false,
}: FormSignatureProps) {
  const {
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useFormContext();
  const currentValue = watch(name);
  const error = errors[name]?.message as string | undefined;

  // Debug: Monitor signature value changes
  useEffect(() => {
    console.log(
      `[FormSignature] ${name} - Current value:`,
      currentValue
        ? `${Math.round((currentValue as string).length / 1024)}KB`
        : "null"
    );
  }, [currentValue, name]);

  const handleSignatureChange = (dataUrl: string | null) => {
    console.log(
      `[FormSignature] ${name} - Handling signature change:`,
      dataUrl ? `${Math.round(dataUrl.length / 1024)}KB` : "null"
    );

    if (dataUrl) {
      console.log(`[FormSignature] ${name} - Setting signature data`);
      setValue(name, dataUrl, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    } else {
      console.log(`[FormSignature] ${name} - Clearing signature data`);
      setValue(name, null, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }

    // Force form state update
    trigger(name);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <SignaturePad
        required={required}
        onChange={handleSignatureChange}
        defaultValue={currentValue}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
