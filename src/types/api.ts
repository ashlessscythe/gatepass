import type { GatepassData } from "./gatepass";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  totalPages: number;
}

export type GatepassResponse = ApiResponse<GatepassData>;
export type GatepassListResponse = ApiResponse<PaginatedResponse<GatepassData>>;
