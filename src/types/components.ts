import type { GatepassData } from "./gatepass";

export interface GatepassFormProps {
  initialData?: Partial<GatepassData>;
  onSubmit: (data: Partial<GatepassData>) => Promise<void>;
  isLoading?: boolean;
}

export interface GatepassPreviewProps {
  data: GatepassData;
}

export interface GatepassTableProps {
  gatepasses: GatepassData[];
  total: number;
  pages: number;
  onPageChange?: (page: number) => void;
  onRowClick?: (gatepass: GatepassData) => void;
}

export interface SignaturePadProps {
  onChange: (signature: string | null) => void;
  value?: string | null;
  disabled?: boolean;
}
