import { Card } from "@/components/ui/card";
import DocumentHandling from "./DocumentHandling";
import SealManagement from "./SealManagement";

export default function WarehouseDashboard() {
  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
      <h1 className="text-2xl md:text-3xl font-bold">Warehouse Dashboard</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Document Handling</h2>
          <DocumentHandling />
        </Card>

        <Card className="p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Seal Management</h2>
          <SealManagement />
        </Card>
      </div>
    </div>
  );
}
