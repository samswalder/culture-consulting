"use client";

import { useEffect, useRef } from "react";
import type { BlobDef } from "@/lib/blobConfig";

interface BlobCircleProps {
  blob: BlobDef;
  isActive: boolean;
  isDragSource: boolean;
  justConnected: boolean;
  onPointerDown: (id: string, e: React.PointerEvent) => void;
}

export default function BlobCircle({
  blob,
  isActive,
  isDragSource,
  justConnected,
  onPointerDown,
}: BlobCircleProps) {
  const elRef = useRef<HTMLDivElement>(null);

  // Pop animation when this blob receives a connection
  useEffect(() => {
    if (!justConnected || !elRef.current) return;
    const el = elRef.current;
    el.style.transition = "transform 0.15s ease-out, background-color 0.15s ease-out";
    el.style.transform = "translate(-50%, -50%) scale(1.5)";
    el.style.backgroundColor = blob.colorSolid;

    const timer = setTimeout(() => {
      el.style.transition = "transform 0.3s ease-in, background-color 0.4s ease-in";
      el.style.transform = "translate(-50%, -50%) scale(1)";
      el.style.backgroundColor = blob.color;
    }, 180);

    return () => clearTimeout(timer);
  }, [justConnected, blob.color, blob.colorSolid]);

  return (
    <div
      ref={elRef}
      data-blob-id={blob.id}
      onPointerDown={(e) => onPointerDown(blob.id, e)}
      className="absolute cursor-pointer select-none touch-none"
      style={{
        left: `${blob.x}%`,
        top: `${blob.y}%`,
        width: blob.size,
        height: blob.size,
        backgroundColor: blob.color,
        borderRadius: blob.borderRadius,
        transform: "translate(-50%, -50%)",
        transition:
          "transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease",
        boxShadow: isActive
          ? `0 0 20px ${blob.colorSolid}`
          : isDragSource
            ? `0 0 16px ${blob.colorSolid}`
            : "none",
        pointerEvents: "auto",
      }}
      onMouseEnter={(e) => {
        if (!justConnected) {
          e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.2)";
          e.currentTarget.style.opacity = "1";
        }
      }}
      onMouseLeave={(e) => {
        if (!justConnected) {
          e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)";
          e.currentTarget.style.opacity = "";
        }
      }}
    />
  );
}
