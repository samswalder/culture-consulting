"use client";

import { useEffect, useRef } from "react";
import type { BlobDef } from "@/lib/blobConfig";

interface BlobCircleProps {
  blob: BlobDef;
  isActive: boolean;
  isDragSource: boolean;
  justConnected: boolean;
  isPlaying: boolean;
  onPointerDown: (id: string, e: React.PointerEvent) => void;
  /** Scale multiplier for blob size (default 1) */
  sizeScale?: number;
  /** Whether the blob accepts pointer interaction (default true) */
  interactive?: boolean;
}

export default function BlobCircle({
  blob,
  isActive,
  isDragSource,
  justConnected,
  isPlaying,
  onPointerDown,
  sizeScale = 1,
  interactive = true,
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

  // Playing animation — brighten + gentle pulse
  useEffect(() => {
    if (!elRef.current) return;
    const el = elRef.current;

    if (isPlaying) {
      el.style.transition =
        "transform 0.3s ease-out, background-color 0.3s ease-out, box-shadow 0.3s ease-out";
      el.style.transform = "translate(-50%, -50%) scale(1.25)";
      el.style.backgroundColor = blob.colorSolid;
      el.style.boxShadow = `0 0 28px ${blob.colorSolid}, 0 0 56px ${blob.color}`;
    } else if (!justConnected) {
      el.style.transition =
        "transform 0.4s ease-in, background-color 0.5s ease-in, box-shadow 0.4s ease-in";
      el.style.transform = "translate(-50%, -50%) scale(1)";
      el.style.backgroundColor = blob.color;
      // Restore the active glow or clear
      el.style.boxShadow = isActive
        ? `0 0 20px ${blob.colorSolid}`
        : isDragSource
          ? `0 0 16px ${blob.colorSolid}`
          : "none";
    }
  }, [isPlaying, justConnected, isActive, isDragSource, blob.color, blob.colorSolid]);

  const scaledSize = blob.size * sizeScale;

  return (
    <div
      ref={elRef}
      data-blob-id={blob.id}
      onPointerDown={interactive ? (e) => onPointerDown(blob.id, e) : undefined}
      className={`absolute select-none ${interactive ? "cursor-pointer touch-none" : ""}`}
      style={{
        left: `${blob.x}%`,
        top: `${blob.y}%`,
        width: scaledSize,
        height: scaledSize,
        backgroundColor: isPlaying ? blob.colorSolid : blob.color,
        borderRadius: blob.borderRadius,
        transform: "translate(-50%, -50%)",
        transition:
          "transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, width 0.5s ease, height 0.5s ease",
        boxShadow: isPlaying
          ? `0 0 28px ${blob.colorSolid}, 0 0 56px ${blob.color}`
          : isActive
            ? `0 0 20px ${blob.colorSolid}`
            : isDragSource
              ? `0 0 16px ${blob.colorSolid}`
              : "none",
        pointerEvents: interactive ? "auto" : "none",
      }}
      onMouseEnter={interactive ? (e) => {
        if (!justConnected && !isPlaying) {
          e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.2)";
          e.currentTarget.style.opacity = "1";
        }
      } : undefined}
      onMouseLeave={interactive ? (e) => {
        if (!justConnected && !isPlaying) {
          e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)";
          e.currentTarget.style.opacity = "";
        }
      } : undefined}
    />
  );
}
