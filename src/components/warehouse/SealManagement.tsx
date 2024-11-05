"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import type { PendingDocument, SealAssignmentData } from "@/types/gatepass";
import { GatepassStatus } from "@prisma/client";

export default function SealManagement() {
  const [gatepasses, setGatepasses] = useState<PendingDocument[]>([]);
  const [selectedGatepass, setSelectedGatepass] = useState<string | null>(null);
  const [sealNumber, setSealNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Memoized fetchGatepasses to avoid unnecessary re-creations
  const fetchGatepasses = useCallback(async () => {
    try {
      const response = await fetch("/api/warehouse/pending-seals");
      if (!response.ok) throw new Error("Failed to fetch gatepasses");
      const data = await response.json();
      setGatepasses(data);
    } catch (error) {
      console.error("Error fetching gatepasses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch gatepasses",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchGatepasses();
  }, [fetchGatepasses]);

  // Memoized handleSealAssignment to prevent re-creation and dependency issues
  const handleSealAssignment = useCallback(async () => {
    if (!selectedGatepass || !sealNumber.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/warehouse/seal-assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gatepassId: selectedGatepass,
          sealNumber: sealNumber.trim(),
        } as SealAssignmentData),
      });

      if (!response.ok) throw new Error("Failed to assign seal");

      toast({
        title: "Success",
        description: "Seal assigned successfully",
      });

      // Refresh the list and clear form
      await fetchGatepasses();
      setSelectedGatepass(null);
      setSealNumber("");
    } catch (error) {
      console.error("Error assigning seal:", error);
      toast({
        title: "Error",
        description: "Failed to assign seal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedGatepass, sealNumber, toast, fetchGatepasses]);

  const getStatusBadgeColor = (status: GatepassStatus) => {
    switch (status) {
      case GatepassStatus.AWAITING_SEAL:
        return "bg-yellow-100 text-yellow-800";
      case GatepassStatus.LOADING:
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: GatepassStatus) => {
    return status.toLowerCase().replace(/_/g, " ");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Seal Assignment</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchGatepasses}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-2">
            Select a gatepass to assign seals
          </p>

          {gatepasses.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No pending seal assignments
            </div>
          ) : (
            <div className="space-y-2">
              {gatepasses.map((gatepass) => (
                <Card
                  key={gatepass.id}
                  className={`p-3 cursor-pointer hover:bg-accent ${
                    selectedGatepass === gatepass.id ? "border-primary" : ""
                  }`}
                  onClick={() => setSelectedGatepass(gatepass.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Form #{gatepass.formNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {gatepass.carrier} - {gatepass.operatorName}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded ${getStatusBadgeColor(
                            gatepass.status
                          )}`}
                        >
                          {formatStatus(gatepass.status)}
                        </span>
                        {gatepass.documentsTransferred && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Docs Transferred
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(gatepass.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {selectedGatepass && (
          <Card className="p-4">
            <h4 className="font-medium mb-2">Assign Seal</h4>
            <div className="space-y-2">
              <Input
                placeholder="Enter seal number"
                value={sealNumber}
                onChange={(e) => setSealNumber(e.target.value)}
                disabled={loading}
              />
              <Button
                className="w-full"
                size="sm"
                onClick={handleSealAssignment}
                disabled={loading || !sealNumber.trim()}
              >
                {loading ? "Processing..." : "Assign Seal"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
