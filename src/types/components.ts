import type { Gatepass } from "@prisma/client";

export interface GatepassFormProps {
  initialData?: Partial<Gatepass>;
  onSuccess?: (data: Gatepass) => void;
}

export interface GatepassPreviewProps {
  data: Gatepass;
}

export interface GatepassListProps {
  initialData: Gatepass[];
}

export interface FormFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

export interface FormSelectProps {
  name: string;
  label: string;
  options: Array<{
    value: string;
    label: string;
  }>;
  required?: boolean;
}

export interface FormCheckboxProps {
  name: string;
  label: string;
  required?: boolean;
}

export interface FormSignatureProps {
  name: string;
  label: string;
  required?: boolean;
}
