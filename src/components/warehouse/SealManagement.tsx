"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import type { PendingDocument, SealAssignmentData } from "@/types/gatepass";
import { GatepassStatus } from "@prisma/client";
import { Search } from "lucide-react";

export default function SealManagement() {
  const [gatepasses, setGatepasses] = useState<PendingDocument[]>([]);
  const [selectedGatepass, setSelectedGatepass] = useState<string | null>(null);
  const [sealNumber, setSealNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const formRef = useRef<HTMLDivElement>(null);
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
      case GatepassStatus.LOADING:
        return "bg-blue-100 text-blue-800";
      case GatepassStatus.AWAITING_DOCS:
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: GatepassStatus) => {
    return status.toLowerCase().replace(/_/g, " ");
  };

  // Filter gatepasses based on search query
  const filteredGatepasses = useMemo(() => {
    if (!searchQuery.trim()) return gatepasses;
    const query = searchQuery.toLowerCase();
    return gatepasses.filter(
      (gp) =>
        gp.formNumber?.toLowerCase().includes(query) ||
        gp.carrier?.toLowerCase().includes(query) ||
        gp.operatorName?.toLowerCase().includes(query)
    );
  }, [gatepasses, searchQuery]);

  // Scroll to form when gatepass is selected
  useEffect(() => {
    if (selectedGatepass && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedGatepass]);

  const handleGatepassSelect = (id: string) => {
    setSelectedGatepass(id);
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

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left side: Gatepass list */}
        <Card className="p-4 flex flex-col">
          <div className="mb-3">
            <p className="text-sm text-muted-foreground mb-2">
              Select a gatepass to assign seals ({filteredGatepasses.length}{" "}
              {filteredGatepasses.length === 1 ? "item" : "items"})
            </p>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by form #, carrier, or operator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {filteredGatepasses.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              {searchQuery
                ? "No gatepasses match your search"
                : "No pending seal assignments"}
            </div>
          ) : (
            <div className="space-y-1.5 overflow-y-auto max-h-[600px] pr-2 flex-1 min-h-0">
              {filteredGatepasses.map((gatepass) => (
                <Card
                  key={gatepass.id}
                  className={`p-2 cursor-pointer transition-all ${
                    selectedGatepass === gatepass.id
                      ? "border-primary border-2 bg-primary/5"
                      : "hover:bg-accent border"
                  }`}
                  onClick={() => handleGatepassSelect(gatepass.id)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        Form #{gatepass.formNumber}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {gatepass.carrier} - {gatepass.operatorName}
                      </p>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${getStatusBadgeColor(
                            gatepass.status
                          )}`}
                        >
                          {formatStatus(gatepass.status)}
                        </span>
                        {gatepass.documentsTransferred && (
                          <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                            Docs Transferred
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(gatepass.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* Right side: Form */}
        <div ref={formRef} className="lg:sticky lg:top-4 lg:self-start">
          {selectedGatepass ? (
            <Card className="p-4">
              <h4 className="font-medium mb-3 text-base">Assign Seal</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Selected Gatepass:
                  </p>
                  <p className="font-medium text-sm">
                    Form #
                    {
                      gatepasses.find((gp) => gp.id === selectedGatepass)
                        ?.formNumber
                    }
                  </p>
                </div>
                <div className="space-y-2">
                  <Input
                    placeholder="Enter seal number"
                    value={sealNumber}
                    onChange={(e) => setSealNumber(e.target.value)}
                    disabled={loading}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && sealNumber.trim() && !loading) {
                        handleSealAssignment();
                      }
                    }}
                    autoFocus
                    className="text-sm"
                  />
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={handleSealAssignment}
                    disabled={loading || !sealNumber.trim()}
                  >
                    {loading ? "Processing..." : "Assign Seal"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    size="sm"
                    onClick={() => {
                      setSelectedGatepass(null);
                      setSealNumber("");
                    }}
                    disabled={loading}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-4 flex items-center justify-center min-h-[150px] border-dashed">
              <p className="text-xs text-muted-foreground text-center">
                Select a gatepass from the list to assign a seal
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
