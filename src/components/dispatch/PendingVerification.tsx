"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import type { Gatepass } from "@/types/gatepass";
import { formatDate } from "@/lib/utils";

export function PendingVerification() {
  const [pendingGatepasses, setPendingGatepasses] = useState<Gatepass[]>([]);
  const [bolNumbers, setBolNumbers] = useState<{ [id: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchPendingGatepasses = useCallback(async () => {
    try {
      const response = await fetch("/api/dispatch/pending-verification");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setPendingGatepasses(data);

      // Initialize BOL numbers
      const initialBolNumbers: { [id: string]: string } = {};
      data.forEach((gatepass: Gatepass) => {
        initialBolNumbers[gatepass.id] = gatepass.bolNumber || "";
      });
      setBolNumbers(initialBolNumbers);
    } catch (error) {
      console.error("Error fetching gatepasses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch pending gatepasses",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchPendingGatepasses();
  }, [fetchPendingGatepasses]);

  const verifyBol = async (gatepassId: string) => {
    const bolNumber = bolNumbers[gatepassId];
    if (!bolNumber) {
      toast({
        title: "Error",
        description: "BOL number is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/dispatch/verify-bol", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gatepassId, bolNumber }),
      });

      if (!response.ok) throw new Error("Failed to verify BOL");

      toast({
        title: "Success",
        description: "BOL verified successfully",
      });

      // Refresh the list
      await fetchPendingGatepasses();
    } catch (error) {
      console.error("Error verifying BOL:", error);
      toast({
        title: "Error",
        description: "Failed to verify BOL",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">BOL Verification</h2>
        <Button onClick={fetchPendingGatepasses} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Form #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Carrier</TableHead>
              <TableHead>Driver</TableHead>
              <TableHead>BOL #</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pendingGatepasses.map((gatepass) => (
              <TableRow key={gatepass.id}>
                <TableCell>{gatepass.formNumber}</TableCell>
                <TableCell>{formatDate(gatepass.dateIn)}</TableCell>
                <TableCell>{gatepass.carrier}</TableCell>
                <TableCell>{gatepass.operatorName}</TableCell>
                <TableCell>
                  <Input
                    value={bolNumbers[gatepass.id] || ""}
                    onChange={(e) =>
                      setBolNumbers((prev) => ({
                        ...prev,
                        [gatepass.id]: e.target.value,
                      }))
                    }
                    placeholder="Enter BOL #"
                    disabled={loading}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => verifyBol(gatepass.id)}
                    disabled={loading || !bolNumbers[gatepass.id]}
                    size="sm"
                  >
                    Verify
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
