"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import SignaturePadBase from "signature_pad";

interface SignaturePadProps {
  onChange: (dataUrl: string | null) => void;
  defaultValue?: string;
  label: string;
  required?: boolean;
}

export function SignaturePad({
  onChange,
  defaultValue,
  label,
  required = false,
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePadBase | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(() => {
    if (signaturePadRef.current) {
      if (signaturePadRef.current.isEmpty()) {
        if (required) {
          setError("Signature is required");
          return;
        }
        onChange(null);
        return;
      }
      console.log("Saving signature..."); // Debug log
      const dataUrl = signaturePadRef.current.toDataURL("image/png");
      console.log("Signature data:", dataUrl.substring(0, 50) + "..."); // Debug log
      onChange(dataUrl);
      setError(null);
    }
  }, [onChange, required]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = 200; // Fixed height for better signature space

    signaturePadRef.current = new SignaturePadBase(canvas, {
      backgroundColor: "rgb(255, 255, 255)",
      penColor: "rgb(0, 0, 0)",
    });

    if (defaultValue) {
      signaturePadRef.current.fromDataURL(defaultValue);
    }

    // Add event listener to canvas
    canvas.addEventListener("mouseup", save);
    canvas.addEventListener("touchend", save);

    const handleResize = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = 200 * ratio;
      const context = canvas.getContext("2d");
      if (context) {
        context.scale(ratio, ratio);
      }
      if (signaturePadRef.current) {
        signaturePadRef.current.clear();
        if (defaultValue) {
          signaturePadRef.current.fromDataURL(defaultValue);
        }
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mouseup", save);
      canvas.removeEventListener("touchend", save);
      if (signaturePadRef.current) {
        signaturePadRef.current.off();
      }
    };
  }, [defaultValue, save]);

  const clear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
      onChange(null);
      setError(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <button
          type="button"
          onClick={clear}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Clear
        </button>
      </div>
      <div className="border rounded-md p-2 bg-white">
        <canvas
          ref={canvasRef}
          className="w-full touch-none"
          style={{ height: "200px" }}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="button"
        onClick={save}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
      >
        Save Signature
      </button>
    </div>
  );
}
