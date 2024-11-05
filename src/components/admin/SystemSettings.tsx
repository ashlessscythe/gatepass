"use client";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export function SystemSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    companyName: "",
    defaultTimeZone: "UTC",
    sessionTimeout: "30",
    requireTwoFactor: false,
  });

  // This is a placeholder for future implementation
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Coming Soon",
      description:
        "System settings functionality will be implemented in a future update.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
        <CardDescription>
          Configure system-wide settings and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="companyName">Company Name</label>
              <Input
                id="companyName"
                value={settings.companyName}
                onChange={(e) =>
                  setSettings({ ...settings, companyName: e.target.value })
                }
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="timezone">Default Time Zone</label>
              <Select
                value={settings.defaultTimeZone}
                onValueChange={(value) =>
                  setSettings({ ...settings, defaultTimeZone: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">
                    Pacific Time
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="sessionTimeout">Session Timeout (minutes)</label>
              <Input
                id="sessionTimeout"
                type="number"
                min="5"
                max="120"
                value={settings.sessionTimeout}
                onChange={(e) =>
                  setSettings({ ...settings, sessionTimeout: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.requireTwoFactor}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      requireTwoFactor: e.target.checked,
                    })
                  }
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span>Require Two-Factor Authentication</span>
              </label>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit">Save Settings</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
