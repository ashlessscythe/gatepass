"use client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import type {
  PendingDocument,
  DocumentTransferData,
  SignatureUpdateData,
} from "@/types/gatepass";
import { SignaturePad } from "@/components/signature/SignaturePad";
import { GatepassStatus } from "@prisma/client";
import { Search, Maximize2 } from "lucide-react";

export default function DocumentHandling() {
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>(
    []
  );
  const [selectedGatepass, setSelectedGatepass] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shipperSignature, setShipperSignature] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFullscreenSignature, setShowFullscreenSignature] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
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

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Document transfer error:", errorText);
        throw new Error(errorText || "Failed to update document status");
      }

      const result = await response.json();
      console.log("Document transfer success:", result);

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

  const handleSaveSignature = useCallback(
    async (dataUrl: string) => {
      if (!selectedGatepass) return;

      setLoading(true);
      try {
        const response = await fetch("/api/warehouse/update-signature", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gatepassId: selectedGatepass,
            signature: dataUrl,
          } as SignatureUpdateData),
        });

        if (!response.ok) throw new Error("Failed to save signature");

        // Update local state and pending documents list
        setShipperSignature(dataUrl);
        setPendingDocuments((prev) =>
          prev.map((doc) =>
            doc.id === selectedGatepass
              ? { ...doc, shipperSignature: dataUrl }
              : doc
          )
        );

        toast({
          title: "Success",
          description: "Signature saved successfully",
        });
      } catch (error) {
        console.error("Error saving signature:", error);
        toast({
          title: "Error",
          description: "Failed to save signature",
          variant: "destructive",
        });
        throw error; // Re-throw so SignaturePad can handle it
      } finally {
        setLoading(false);
      }
    },
    [selectedGatepass, toast]
  );

  const getStatusBadgeColor = (status: GatepassStatus) => {
    switch (status) {
      case GatepassStatus.AWAITING_DOCS:
        return "bg-yellow-100 text-yellow-800";
      case GatepassStatus.COMPLETED:
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: GatepassStatus) => {
    return status.toLowerCase().replace(/_/g, " ");
  };

  // Filter documents based on search query
  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) return pendingDocuments;
    const query = searchQuery.toLowerCase();
    return pendingDocuments.filter(
      (doc) =>
        doc.formNumber?.toLowerCase().includes(query) ||
        doc.carrier?.toLowerCase().includes(query) ||
        doc.operatorName?.toLowerCase().includes(query)
    );
  }, [pendingDocuments, searchQuery]);

  // Scroll to form when gatepass is selected
  useEffect(() => {
    if (selectedGatepass && formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedGatepass]);

  const handleGatepassSelect = useCallback(
    (id: string) => {
      setSelectedGatepass(id);
      // Load the saved signature for this gatepass if it exists
      const selectedDoc = pendingDocuments.find((doc) => doc.id === id);
      setShipperSignature(selectedDoc?.shipperSignature || null);
    },
    [pendingDocuments]
  );

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

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left side: Document list */}
        <Card className="p-4 flex flex-col">
          <div className="mb-3">
            <p className="text-sm text-muted-foreground mb-2">
              Select a gatepass to manage its documents (
              {filteredDocuments.length}{" "}
              {filteredDocuments.length === 1 ? "item" : "items"})
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

          {filteredDocuments.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-8">
              {searchQuery
                ? "No gatepasses match your search"
                : "No pending documents"}
            </div>
          ) : (
            <div className="space-y-1.5 overflow-y-auto max-h-[600px] pr-2 flex-1 min-h-0">
              {filteredDocuments.map((doc) => (
                <Card
                  key={doc.id}
                  className={`p-2 cursor-pointer transition-all ${
                    selectedGatepass === doc.id
                      ? "border-primary border-2 bg-primary/5"
                      : "hover:bg-accent border"
                  }`}
                  onClick={() => handleGatepassSelect(doc.id)}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        Form #{doc.formNumber}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {doc.carrier} - {doc.operatorName}
                      </p>
                      <div className="flex gap-1.5 mt-1 flex-wrap">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded ${getStatusBadgeColor(
                            doc.status
                          )}`}
                        >
                          {formatStatus(doc.status)}
                        </span>
                        {doc.sealed && (
                          <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                            Sealed
                          </span>
                        )}
                        {doc.documentsTransferred && (
                          <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                            Docs Transferred
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(doc.createdAt).toLocaleDateString()}
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
              <h4 className="font-medium mb-3 text-base">Document Actions</h4>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Selected Gatepass:
                  </p>
                  <p className="font-medium text-sm">
                    Form #
                    {
                      pendingDocuments.find(
                        (doc) => doc.id === selectedGatepass
                      )?.formNumber
                    }
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">
                      Shipper signature is required to confirm document transfer
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFullscreenSignature(true)}
                      className="gap-2"
                    >
                      <Maximize2 className="h-4 w-4" />
                      Fullscreen
                    </Button>
                  </div>
                  <SignaturePad
                    onChange={handleSignatureChange}
                    onSave={handleSaveSignature}
                    defaultValue={shipperSignature}
                    required
                  />
                </div>

                {/* Fullscreen Signature Dialog */}
                <Dialog
                  open={showFullscreenSignature}
                  onOpenChange={setShowFullscreenSignature}
                >
                  <DialogContent className="max-w-[95vw] w-full max-h-[95vh] h-[95vh] flex flex-col p-4 sm:p-6 translate-x-[-50%] translate-y-[-50%] left-[50%] top-[50%]">
                    <DialogHeader className="flex-shrink-0">
                      <DialogTitle className="text-xl">
                        Driver Signature
                      </DialogTitle>
                      <DialogDescription>
                        Please sign in the area below. Form #{" "}
                        {
                          pendingDocuments.find(
                            (doc) => doc.id === selectedGatepass
                          )?.formNumber
                        }
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 flex flex-col min-h-0 mt-4 overflow-hidden">
                      <div className="flex-1 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white min-h-0 flex items-center justify-center">
                        <div className="w-full h-full">
                          <SignaturePad
                            onChange={handleSignatureChange}
                            onSave={async (dataUrl) => {
                              await handleSaveSignature(dataUrl);
                              setShowFullscreenSignature(false);
                            }}
                            defaultValue={shipperSignature}
                            required
                            fullscreen={true}
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          onClick={() => setShowFullscreenSignature(false)}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
                <div className="space-y-2">
                  <Button
                    className="w-full"
                    size="sm"
                    onClick={handleDocumentTransfer}
                    disabled={loading || !shipperSignature}
                  >
                    {loading ? "Processing..." : "Mark Documents Transferred"}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    size="sm"
                    onClick={() => {
                      setSelectedGatepass(null);
                      setShipperSignature(null);
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
                Select a gatepass from the list to manage documents
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
