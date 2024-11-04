import { Card } from "@/components/ui/card";
import DocumentHandling from "./DocumentHandling";
import SealManagement from "./SealManagement";

export default function WarehouseDashboard() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Warehouse Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Document Handling</h2>
          <DocumentHandling />
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-semibold mb-4">Seal Management</h2>
          <SealManagement />
        </Card>
      </div>
    </div>
  );
}
