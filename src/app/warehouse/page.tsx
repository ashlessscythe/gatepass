import { Metadata } from "next";
import WarehouseDashboard from "@/components/warehouse/WarehouseDashboard";
import { config } from "@/lib/config";

export const metadata: Metadata = {
  title: `Warehouse Dashboard | ${config.publicAppName}`,
  description: `Warehouse operations management for ${config.publicAppName}`,
};

export default function WarehousePage() {
  return <WarehouseDashboard />;
}
