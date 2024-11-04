import { Metadata } from "next";
import WarehouseDashboard from "@/components/warehouse/WarehouseDashboard";

export const metadata: Metadata = {
  title: "Warehouse Dashboard | Gatepass",
  description: "Warehouse operations management for Gatepass system",
};

export default function WarehousePage() {
  return <WarehouseDashboard />;
}
