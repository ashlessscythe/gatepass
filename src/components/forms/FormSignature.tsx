"use client";

import { useFormContext } from "react-hook-form";
import { SignaturePad } from "@/components/signature/SignaturePad";

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
    formState: { errors },
  } = useFormContext();

  // Watch the current value
  const currentValue = watch(name);

  const handleSignatureChange = (dataUrl: string | null) => {
    console.log(
      `Setting signature for ${name}:`,
      dataUrl ? "has data" : "null"
    ); // Debug log
    setValue(name, dataUrl, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const error = errors[name]?.message as string | undefined;

  return (
    <div className="space-y-2">
      <SignaturePad
        label={label}
        required={required}
        onChange={handleSignatureChange}
        defaultValue={currentValue}
      />
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
    </div>
  );
}
