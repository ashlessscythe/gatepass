"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PendingVerification } from "./PendingVerification";
import { YardManagement } from "./YardManagement";
import { StatusManagement } from "./StatusManagement";

export function DispatchDashboard() {
  const [activeTab, setActiveTab] = useState("pending");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">BOL Verification</TabsTrigger>
          <TabsTrigger value="yard">Yard Management</TabsTrigger>
          <TabsTrigger value="status">Status Management</TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <PendingVerification />
        </TabsContent>
        <TabsContent value="yard">
          <YardManagement />
        </TabsContent>
        <TabsContent value="status">
          <StatusManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
