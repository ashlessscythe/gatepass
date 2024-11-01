"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GatepassStatus } from "@prisma/client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Gatepass } from "@/types/gatepass";
import { formatDate } from "@/lib/utils";

export function YardManagement() {
  const [gatepasses, setGatepasses] = useState<Gatepass[]>([]);
  const [pickupDoors, setPickupDoors] = useState<{ [id: string]: string }>({});
  const [statuses, setStatuses] = useState<{ [id: string]: GatepassStatus }>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchGatepasses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/dispatch/verified-gatepasses");
      if (!response.ok) throw new Error("Failed to fetch gatepasses");
      const data = await response.json();
      setGatepasses(data);

      // Initialize pickup doors and statuses
      const initialDoors: { [id: string]: string } = {};
      const initialStatuses: { [id: string]: GatepassStatus } = {};
      data.forEach((gatepass: Gatepass) => {
        initialDoors[gatepass.id] = gatepass.pickupDoor || "";
        initialStatuses[gatepass.id] = gatepass.status;
      });
      setPickupDoors(initialDoors);
      setStatuses(initialStatuses);
    } catch (error) {
      console.error("Error fetching gatepasses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch gatepasses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (gatepassId: string, status: GatepassStatus) => {
    try {
      setLoading(true);
      const response = await fetch("/api/dispatch/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gatepassId, status }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      toast({
        title: "Success",
        description: "Status updated successfully",
      });

      // Update local state
      setStatuses((prev) => ({ ...prev, [gatepassId]: status }));
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const assignPickupDoor = async (gatepassId: string) => {
    const door = pickupDoors[gatepassId];
    if (!door) return;

    try {
      setLoading(true);
      const response = await fetch("/api/dispatch/assign-door", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gatepassId, door }),
      });

      if (!response.ok) throw new Error("Failed to assign door");

      toast({
        title: "Success",
        description: "Pickup door assigned successfully",
      });

      // Update status to IN_YARD after assigning door
      await updateStatus(gatepassId, GatepassStatus.IN_YARD);
    } catch (error) {
      console.error("Error assigning door:", error);
      toast({
        title: "Error",
        description: "Failed to assign pickup door",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, value: GatepassStatus) => {
    await updateStatus(id, value);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Yard Management</h2>
        <Button onClick={fetchGatepasses} disabled={loading}>
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
              <TableHead>Pickup Door</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {gatepasses.map((gatepass) => (
              <TableRow key={gatepass.id}>
                <TableCell>{gatepass.formNumber}</TableCell>
                <TableCell>{formatDate(gatepass.dateIn)}</TableCell>
                <TableCell>{gatepass.carrier}</TableCell>
                <TableCell>{gatepass.operatorName}</TableCell>
                <TableCell>{gatepass.bolNumber || "-"}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Input
                      value={pickupDoors[gatepass.id] || ""}
                      onChange={(e) =>
                        setPickupDoors((prev) => ({
                          ...prev,
                          [gatepass.id]: e.target.value,
                        }))
                      }
                      placeholder="Enter door"
                      disabled={loading}
                    />
                    <Button
                      size="sm"
                      onClick={() => assignPickupDoor(gatepass.id)}
                      disabled={loading || !pickupDoors[gatepass.id]}
                    >
                      Assign
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={statuses[gatepass.id]}
                    onValueChange={(value) =>
                      handleStatusChange(gatepass.id, value as GatepassStatus)
                    }
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(GatepassStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.toLowerCase().replace("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  {gatepass.status === GatepassStatus.BOL_VERIFIED && (
                    <Button
                      onClick={() =>
                        handleStatusChange(gatepass.id, GatepassStatus.IN_YARD)
                      }
                      size="sm"
                      disabled={loading}
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
    </div>
  );
}
