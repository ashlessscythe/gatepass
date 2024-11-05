"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GatepassStatus } from "@prisma/client";
import {
  getStatusDisplayName,
  isValidTransition,
} from "@/lib/status-management";

interface Gatepass {
  id: string;
  formNumber: string | null;
  carrier: string;
  operatorName: string;
  status: GatepassStatus;
  sealed: boolean;
  documentsTransferred: boolean;
}

export function StatusManagement() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [gatepasses, setGatepasses] = useState<Gatepass[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch gatepasses that can have status changes
  const fetchGatepasses = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/dispatch/gatepasses");
      if (!response.ok) throw new Error("Failed to fetch gatepasses");
      const data = await response.json();
      setGatepasses(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch gatepasses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch data on component mount
  useEffect(() => {
    fetchGatepasses();
  }, [fetchGatepasses]);

  // Handle status change
  const handleStatusChange = useCallback(
    async (gatepassId: string, newStatus: GatepassStatus) => {
      setLoading(true);
      try {
        const response = await fetch("/api/dispatch/update-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            gatepassId,
            status: newStatus,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(error);
        }

        toast({
          title: "Success",
          description: "Status updated successfully",
        });

        // Refresh the list
        fetchGatepasses();
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to update status",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    [toast, fetchGatepasses]
  );

  // Filter gatepasses based on search term
  const filteredGatepasses = gatepasses.filter(
    (gatepass) =>
      gatepass.formNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gatepass.carrier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gatepass.operatorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status Management</CardTitle>
        <CardDescription>Update and track gatepass statuses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search by form number, carrier, or operator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <Button
              variant="outline"
              onClick={() => fetchGatepasses()}
              disabled={loading}
            >
              Refresh
            </Button>
          </div>

          <div className="border rounded-md">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-2 text-left">Form #</th>
                  <th className="p-2 text-left">Carrier</th>
                  <th className="p-2 text-left">Operator</th>
                  <th className="p-2 text-left">Current Status</th>
                  <th className="p-2 text-left">New Status</th>
                  <th className="p-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredGatepasses.map((gatepass) => (
                  <tr key={gatepass.id} className="border-b">
                    <td className="p-2">{gatepass.formNumber}</td>
                    <td className="p-2">{gatepass.carrier}</td>
                    <td className="p-2">{gatepass.operatorName}</td>
                    <td className="p-2">
                      {getStatusDisplayName(gatepass.status)}
                    </td>
                    <td className="p-2">
                      <Select
                        onValueChange={(value) =>
                          handleStatusChange(
                            gatepass.id,
                            value as GatepassStatus
                          )
                        }
                        disabled={loading}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(GatepassStatus)
                            .filter(
                              (status) =>
                                status !== gatepass.status &&
                                isValidTransition(gatepass.status, status)
                            )
                            .map((status) => (
                              <SelectItem key={status} value={status}>
                                {getStatusDisplayName(status)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-2">
                        {gatepass.sealed && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Sealed
                          </span>
                        )}
                        {gatepass.documentsTransferred && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Docs Transferred
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
