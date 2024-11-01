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
import type { GatepassData } from "@/types/gatepass";

export function PendingVerification() {
  const [pendingGatepasses, setPendingGatepasses] = useState<GatepassData[]>(
    []
  );
  const [bolNumbers, setBolNumbers] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const fetchPendingGatepasses = useCallback(async () => {
    try {
      const response = await fetch("/api/dispatch/pending-verification");
      if (!response.ok) throw new Error("Failed to fetch pending gatepasses");
      const data = await response.json();
      setPendingGatepasses(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load pending gatepasses",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchPendingGatepasses();
  }, [fetchPendingGatepasses]);

  const verifyBOL = async (gatepassId: string) => {
    const bolNumber = bolNumbers[gatepassId];
    if (!bolNumber) {
      toast({
        title: "Error",
        description: "Please enter a BOL number",
        variant: "destructive",
      });
      return;
    }

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

      // Remove verified gatepass from the list
      setPendingGatepasses((prev) => prev.filter((gp) => gp.id !== gatepassId));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to verify BOL",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Pending BOL Verification</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Gatepass No.</TableHead>
            <TableHead>Date In</TableHead>
            <TableHead>Carrier</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Truck No.</TableHead>
            <TableHead>BOL Number</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingGatepasses.map((gatepass) => (
            <TableRow key={gatepass.id}>
              <TableCell>{gatepass.formNumber}</TableCell>
              <TableCell>
                {new Date(gatepass.dateIn).toLocaleDateString()}
              </TableCell>
              <TableCell>{gatepass.carrier}</TableCell>
              <TableCell>{gatepass.operatorName}</TableCell>
              <TableCell>{gatepass.truckNo}</TableCell>
              <TableCell>
                <Input
                  placeholder="Enter BOL #"
                  value={bolNumbers[gatepass.id] || ""}
                  onChange={(e) =>
                    setBolNumbers((prev) => ({
                      ...prev,
                      [gatepass.id]: e.target.value,
                    }))
                  }
                  className="w-32"
                />
              </TableCell>
              <TableCell>
                <Button onClick={() => verifyBOL(gatepass.id)} className="w-20">
                  Verify
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
