"use client";

import { useFormContext } from "react-hook-form";

interface FormCheckboxProps {
  name: string;
  label: string;
}

export function FormCheckbox({ name, label }: FormCheckboxProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return (
    <div className="flex items-center space-x-2">
      <input
        {...register(name)}
        type="checkbox"
        id={name}
        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
      />
      <label
        htmlFor={name}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {label}
      </label>
      {error && <p className="text-sm font-medium text-red-500">{error}</p>}
    </div>
  );
}
