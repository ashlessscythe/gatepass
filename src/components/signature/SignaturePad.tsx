"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import SignaturePadBase from "signature_pad";
import { Button } from "@/components/ui/button";

export interface SignaturePadProps {
  onChange: (dataUrl: string | null) => void;
  defaultValue?: string | null;
  required?: boolean;
}

export function SignaturePad({
  onChange,
  defaultValue,
  required = false,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePadBase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const checkSignature = useCallback(() => {
    if (signaturePadRef.current) {
      const isEmpty = signaturePadRef.current.isEmpty();
      console.log("[SignaturePad] Checking signature - isEmpty:", isEmpty);
      setHasSignature(!isEmpty);
      return !isEmpty;
    }
    return false;
  }, []);

  const handleDrawing = useCallback(() => {
    console.log("[SignaturePad] Drawing detected");
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      setHasSignature(true);
      setIsSaved(false);
    }
  }, []);

  const compressImage = (canvas: HTMLCanvasElement): string => {
    try {
      const tempCanvas = document.createElement("canvas");
      const ctx = tempCanvas.getContext("2d");
      if (!ctx) {
        console.warn("[SignaturePad] Failed to get 2D context for compression");
        return canvas.toDataURL();
      }

      const maxWidth = 800;
      const maxHeight = 400;
      let width = canvas.width;
      let height = canvas.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      tempCanvas.width = width;
      tempCanvas.height = height;
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(canvas, 0, 0, width, height);

      const dataUrl = tempCanvas.toDataURL("image/jpeg", 0.5);
      console.log(
        "[SignaturePad] Compressed signature size:",
        Math.round(dataUrl.length / 1024),
        "KB"
      );
      return dataUrl;
    } catch (error) {
      console.error("[SignaturePad] Error compressing signature:", error);
      return canvas.toDataURL();
    }
  };

  const save = useCallback(() => {
    console.log("[SignaturePad] Save triggered - hasSignature:", hasSignature);
    if (signaturePadRef.current && canvasRef.current) {
      if (signaturePadRef.current.isEmpty()) {
        console.log("[SignaturePad] Signature pad is empty");
        if (required) {
          setError("Signature is required");
          return;
        }
        onChange(null);
        setIsSaved(false);
        setHasSignature(false);
        return;
      }

      setError(null);
      try {
        const compressedDataUrl = compressImage(canvasRef.current);
        console.log("[SignaturePad] Saving signature data...");
        onChange(compressedDataUrl);
        setIsSaved(true);
        setHasSignature(true);
        console.log("[SignaturePad] Signature saved successfully");
      } catch (error) {
        console.error("[SignaturePad] Error saving signature:", error);
        setError("Failed to save signature");
        setIsSaved(false);
      }
    }
  }, [onChange, required, hasSignature]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.warn("[SignaturePad] Canvas not found");
      return;
    }

    const parentWidth = canvas.parentElement?.offsetWidth || 300;
    canvas.width = parentWidth;
    canvas.height = 200;

    console.log(
      "[SignaturePad] Initializing with dimensions:",
      parentWidth,
      "x",
      200
    );

    signaturePadRef.current = new SignaturePadBase(canvas, {
      backgroundColor: "rgb(255, 255, 255)",
      onBegin: () => {
        console.log("[SignaturePad] Started drawing");
        setError(null);
        setIsSaved(false);
      },
      onEnd: () => {
        console.log("[SignaturePad] Finished drawing");
        checkSignature();
      },
    });

    // Add multiple event listeners to catch all drawing activities
    const events = ["mousedown", "mousemove", "touchstart", "touchmove"];
    events.forEach((event) => {
      canvas.addEventListener(event, handleDrawing);
    });

    const handleEndEvents = () => {
      console.log("[SignaturePad] Draw end event");
      if (checkSignature()) {
        handleDrawing();
      }
    };

    canvas.addEventListener("mouseup", handleEndEvents);
    canvas.addEventListener("touchend", handleEndEvents);

    // Add pointermove event listener
    canvas.addEventListener("pointermove", handleDrawing);

    // Monitor canvas changes
    const observer = new MutationObserver(() => {
      console.log("[SignaturePad] Canvas mutation detected");
      handleDrawing();
    });
    observer.observe(canvas, {
      attributes: true,
      childList: true,
      subtree: true,
    });

    if (defaultValue) {
      try {
        console.log("[SignaturePad] Loading default value");
        signaturePadRef.current.fromDataURL(defaultValue);
        setIsSaved(true);
        setHasSignature(true);
      } catch (error) {
        console.error("[SignaturePad] Error loading default signature:", error);
      }
    }

    return () => {
      console.log("[SignaturePad] Cleaning up");
      if (signaturePadRef.current) {
        signaturePadRef.current.off();
      }
      events.forEach((event) => {
        canvas.removeEventListener(event, handleDrawing);
      });
      canvas.removeEventListener("mouseup", handleEndEvents);
      canvas.removeEventListener("touchend", handleEndEvents);
      canvas.removeEventListener("pointermove", handleDrawing);
      observer.disconnect();
    };
  }, [defaultValue, checkSignature, handleDrawing]);

  const clear = () => {
    console.log("[SignaturePad] Clearing signature");
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      onChange(null);
      setError(null);
      setHasSignature(false);
      setIsSaved(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <div className="border rounded-md overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            className="w-full touch-none cursor-crosshair"
            style={{ touchAction: "none" }}
          />
        </div>
        {hasSignature && !isSaved && (
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            Click Save to keep your signature
          </div>
        )}
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {isSaved && (
        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
          ✓ Signature saved successfully
        </p>
      )}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={clear}
          className="text-sm"
        >
          Clear
        </Button>
        <Button
          type="button"
          onClick={save}
          className={`text-sm ${
            hasSignature && !isSaved
              ? "bg-green-600 hover:bg-green-700 text-white"
              : hasSignature && isSaved
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
          disabled={!hasSignature}
        >
          {isSaved ? "Update Signature" : "Save Signature"}
        </Button>
      </div>
      {hasSignature && !isSaved && (
        <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
          ⚠️ Don&apos;t forget to save your signature
        </p>
      )}
    </div>
  );
}
