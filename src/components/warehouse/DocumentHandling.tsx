"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import type {
  PendingDocument,
  DocumentTransferData,
  SignatureUpdateData,
} from "@/types/gatepass";
import { SignaturePad } from "@/components/signature/SignaturePad";
import { GatepassStatus } from "@prisma/client";

export default function DocumentHandling() {
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>(
    []
  );
  const [selectedGatepass, setSelectedGatepass] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shipperSignature, setShipperSignature] = useState<string | null>(null);
  const { toast } = useToast();

  // Memoize fetchPendingDocuments to prevent unnecessary re-creations
  const fetchPendingDocuments = useCallback(async () => {
    try {
      const response = await fetch("/api/warehouse/pending-documents");
      if (!response.ok) throw new Error("Failed to fetch documents");
      const data = await response.json();
      setPendingDocuments(data);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to fetch pending documents",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    fetchPendingDocuments();
  }, [fetchPendingDocuments]);

  const handleDocumentTransfer = useCallback(async () => {
    if (!selectedGatepass || !shipperSignature) {
      toast({
        title: "Error",
        description: "Driver signature is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // First update the signature
      const signatureResponse = await fetch("/api/warehouse/update-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gatepassId: selectedGatepass,
          signature: shipperSignature,
        } as SignatureUpdateData),
      });

      if (!signatureResponse.ok) throw new Error("Failed to save signature");

      // Then mark documents as transferred
      const response = await fetch("/api/warehouse/document-transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gatepassId: selectedGatepass,
        } as DocumentTransferData),
      });

      if (!response.ok) throw new Error("Failed to update document status");

      toast({
        title: "Success",
        description: "Documents marked as transferred",
      });

      // Reset form and refresh list
      setShipperSignature(null);
      setSelectedGatepass(null);
      await fetchPendingDocuments();
    } catch (error) {
      console.error("Error updating document status:", error);
      toast({
        title: "Error",
        description: "Failed to update document status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [selectedGatepass, shipperSignature, toast, fetchPendingDocuments]);

  const handleSignatureChange = useCallback((dataUrl: string | null) => {
    setShipperSignature(dataUrl);
  }, []);

  const getStatusBadgeColor = (status: GatepassStatus) => {
    switch (status) {
      case GatepassStatus.AWAITING_DOCS:
        return "bg-yellow-100 text-yellow-800";
      case GatepassStatus.DOCS_TRANSFERRED:
        return "bg-green-100 text-green-800";
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
        <h3 className="text-lg font-medium">Pending Documents</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchPendingDocuments}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      <div className="space-y-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground mb-2">
            Select a gatepass to manage its documents
          </p>

          {pendingDocuments.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No pending documents
            </div>
          ) : (
            <div className="space-y-2">
              {pendingDocuments.map((doc) => (
                <Card
                  key={doc.id}
                  className={`p-3 cursor-pointer hover:bg-accent ${
                    selectedGatepass === doc.id ? "border-primary" : ""
                  }`}
                  onClick={() => setSelectedGatepass(doc.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Form #{doc.formNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {doc.carrier} - {doc.operatorName}
                      </p>
                      <div className="flex gap-2 mt-1">
                        <span
                          className={`text-xs px-2 py-1 rounded ${getStatusBadgeColor(
                            doc.status
                          )}`}
                        >
                          {formatStatus(doc.status)}
                        </span>
                        {doc.sealed && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Sealed
                          </span>
                        )}
                        {doc.documentsTransferred && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Docs Transferred
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {selectedGatepass && (
          <Card className="p-4">
            <h4 className="font-medium mb-2">Document Actions</h4>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Shipper signature is required to confirm document transfer
                </p>
                <SignaturePad onChange={handleSignatureChange} required />
              </div>
              <Button
                className="w-full"
                size="sm"
                onClick={handleDocumentTransfer}
                disabled={loading || !shipperSignature}
              >
                {loading ? "Processing..." : "Mark Documents Transferred"}
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
