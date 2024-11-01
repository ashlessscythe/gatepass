"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PendingVerification } from "./PendingVerification";
import { YardManagement } from "./YardManagement";

export function DispatchDashboard() {
  const [activeTab, setActiveTab] = useState("pending");

  return (
    <Card className="p-6">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="pending">Pending Verification</TabsTrigger>
          <TabsTrigger value="yard">Yard Management</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="space-y-4">
          <PendingVerification />
        </TabsContent>
        <TabsContent value="yard" className="space-y-4">
          <YardManagement />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
