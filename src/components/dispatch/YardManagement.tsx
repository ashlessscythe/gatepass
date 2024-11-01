import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { GatepassData } from "@/types/gatepass";
import { GatepassStatus } from "@prisma/client";
import { Input } from "../ui/input";

export function YardManagement() {
  const [verifiedGatepasses, setVerifiedGatepasses] = useState<GatepassData[]>(
    []
  );
  const [pickupDoors, setPickupDoors] = useState<{ [id: string]: string }>({});
  const [statuses, setStatuses] = useState<{ [id: string]: GatepassStatus }>(
    {}
  );
  const { toast } = useToast();

  const fetchVerifiedGatepasses = useCallback(async () => {
    try {
      const response = await fetch("/api/dispatch/pending-verification");
      if (!response.ok) throw new Error("Failed to fetch pending gatepasses");
      const data = await response.json();
      setVerifiedGatepasses(data);

      // Initialize pickupDoors and statuses state for each gatepass
      const initialDoors: { [id: string]: string } = {};
      const initialStatuses: { [id: string]: GatepassStatus } = {};

      data.forEach((gp: GatepassData) => {
        initialDoors[gp.id] = gp.pickupDoor || "";
        initialStatuses[gp.id] = gp.status;
      });

      setPickupDoors(initialDoors);
      setStatuses(initialStatuses);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load pending gatepasses",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchVerifiedGatepasses();
  }, [fetchVerifiedGatepasses]);

  const updateStatus = async (gatepassId: string, status: GatepassStatus) => {
    try {
      const response = await fetch("/api/dispatch/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gatepassId, status }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      const updatedGatepass = await response.json();

      toast({
        title: "Success",
        description: "Status updated successfully",
      });

      setVerifiedGatepasses((prev) =>
        prev.map((gp) => (gp.id === gatepassId ? { ...gp, status } : gp))
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const assignDoor = async (gatepassId: string, doorNumber: string) => {
    try {
      const response = await fetch("/api/dispatch/assign-door", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gatepassId, doorNumber }),
      });

      if (!response.ok) throw new Error("Failed to assign door");

      const updatedGatepass = await response.json();

      toast({
        title: "Success",
        description: "Door updated successfully",
      });

      setVerifiedGatepasses((prev) =>
        prev.map((gp) =>
          gp.id === gatepassId ? { ...gp, pickupDoor: doorNumber } : gp
        )
      );
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update door",
        variant: "destructive",
      });
    }
  };

  const handleDoorChange = (id: string, value: string) => {
    setPickupDoors((prev) => ({
      ...prev,
      [id]: value.toUpperCase(),
    }));
  };

  const handleStatusChange = async (id: string, value: GatepassStatus) => {
    await updateStatus(id, value);
    setStatuses((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Yard Management</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Gatepass No.</TableHead>
            <TableHead>Date In</TableHead>
            <TableHead>Carrier</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Door</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {verifiedGatepasses.map((gatepass) => (
            <TableRow key={gatepass.id}>
              <TableCell>{gatepass.formNumber}</TableCell>
              <TableCell>
                {new Date(gatepass.dateIn).toLocaleDateString()}
              </TableCell>
              <TableCell>{gatepass.carrier}</TableCell>
              <TableCell>{gatepass.operatorName}</TableCell>
              <TableCell>
                <Select
                  value={statuses[gatepass.id] || gatepass.status}
                  onValueChange={(value) =>
                    handleStatusChange(gatepass.id, value as GatepassStatus)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(GatepassStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={pickupDoors[gatepass.id] || ""}
                    onChange={(e) =>
                      handleDoorChange(gatepass.id, e.target.value)
                    }
                    pattern="[A-Z]\d{2}"
                    placeholder="Door"
                    className="w-24 border rounded text-foreground bg-background px-2 py-1 text-center"
                  />
                  <button
                    onClick={() =>
                      assignDoor(gatepass.id, pickupDoors[gatepass.id] || "")
                    }
                    className="px-3 py-1 text-foreground bg-background border rounded hover:bg-blue-600 disabled:bg-gray-400"
                    disabled={!pickupDoors[gatepass.id]}
                  >
                    Update
                  </button>
                </div>
              </TableCell>
              <TableCell>
                {gatepass.status === GatepassStatus.BOL_VERIFIED && (
                  <Button
                    onClick={() =>
                      handleStatusChange(gatepass.id, GatepassStatus.IN_YARD)
                    }
                    disabled={!pickupDoors[gatepass.id]}
                    className="w-20"
                  >
                    Check In
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
