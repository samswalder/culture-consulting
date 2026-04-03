"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTheme } from "@/themes/ThemeProvider";
import { blobs } from "@/lib/blobConfig";
import BlobCircle from "./BlobCircle";
import ConnectionLines from "./ConnectionLines";

/** Check if a point is within a blob's hit area */
function hitTest(
  clientX: number,
  clientY: number,
  container: HTMLDivElement
): string | null {
  const rect = container.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  for (const blob of blobs) {
    const bx = (blob.x / 100) * rect.width;
    const by = (blob.y / 100) * rect.height;
    const dist = Math.sqrt((x - bx) ** 2 + (y - by) ** 2);
    if (dist < blob.size * 0.75) {
      return blob.id;
    }
  }
  return null;
}

export default function BlobPlayground() {
  const { theme } = useTheme();

  const [chain, setChain] = useState<string[]>([]);
  const [dragFrom, setDragFrom] = useState<string | null>(null);
  const [dragLine, setDragLine] = useState<{
    fromId: string;
    toX: number;
    toY: number;
  } | null>(null);
  const [justConnectedId, setJustConnectedId] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const pointerDownTime = useRef(0);
  const pointerDownPos = useRef({ x: 0, y: 0 });
  const dragFromRef = useRef<string | null>(null);
  const chainRef = useRef<string[]>([]);

  // Keep refs in sync with state
  useEffect(() => {
    dragFromRef.current = dragFrom;
  }, [dragFrom]);
  useEffect(() => {
    chainRef.current = chain;
  }, [chain]);

  const activeBlobs = new Set(chain);

  // Clear pop animation flag after it plays
  useEffect(() => {
    if (!justConnectedId) return;
    const timer = setTimeout(() => setJustConnectedId(null), 500);
    return () => clearTimeout(timer);
  }, [justConnectedId]);

  // --- Pointer move: track drag line and detect hover targets ---
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragFromRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setDragLine({
        fromId: dragFromRef.current,
        toX: e.clientX - rect.left,
        toY: e.clientY - rect.top,
      });
    };

    const onUp = (e: PointerEvent) => {
      const source = dragFromRef.current;
      const container = containerRef.current;

      if (!source || !container) {
        // No drag was happening — clear just in case
        setDragFrom(null);
        setDragLine(null);
        return;
      }

      const elapsed = Date.now() - pointerDownTime.current;
      const dx = e.clientX - pointerDownPos.current.x;
      const dy = e.clientY - pointerDownPos.current.y;
      const moveDist = Math.sqrt(dx * dx + dy * dy);
      const isClick = elapsed < 300 && moveDist < 8;

      const targetId = hitTest(e.clientX, e.clientY, container);

      if (isClick && targetId === source) {
        // Click on the same blob — deactivate it
        const prev = chainRef.current;
        const lastIndex = prev.lastIndexOf(source);
        if (lastIndex !== -1) {
          setChain(prev.slice(0, lastIndex));
        }
      } else if (targetId && targetId !== source) {
        // Dragged to a different blob — create connection
        setChain((prev) => {
          if (prev.length === 0) {
            return [source, targetId];
          }
          const last = prev[prev.length - 1];
          if (last === source) {
            return [...prev, targetId];
          }
          return [source, targetId];
        });
        setJustConnectedId(targetId);
      }

      // Always clear drag state
      setDragFrom(null);
      setDragLine(null);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  // --- Blob pointer down: start drag ---
  const handleBlobPointerDown = useCallback(
    (id: string, e: React.PointerEvent) => {
      e.preventDefault();
      pointerDownTime.current = Date.now();
      pointerDownPos.current = { x: e.clientX, y: e.clientY };
      setDragFrom(id);
    },
    []
  );

  // Don't render for non-compact themes
  if (theme.layout !== "single-viewport") return null;

  const playground = (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      style={{ pointerEvents: "none" }}
    >
      <ConnectionLines
        chain={chain}
        blobs={blobs}
        containerRef={containerRef}
        dragLine={dragLine}
      />
      {blobs.map((blob) => (
        <BlobCircle
          key={blob.id}
          blob={blob}
          isActive={activeBlobs.has(blob.id)}
          isDragSource={dragFrom === blob.id}
          justConnected={justConnectedId === blob.id}
          onPointerDown={handleBlobPointerDown}
        />
      ))}
    </div>
  );

  return (
    <>
      {/* Desktop: fixed right side */}
      <div className="hidden md:block fixed top-0 right-0 w-[40vw] h-screen z-10">
        {playground}
      </div>

      {/* Mobile: floating button + overlay */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed bottom-6 left-6 z-50 w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-sm transition-colors duration-200"
          style={{
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: `${theme.colors.background}cc`,
            color: theme.colors.accent,
          }}
          aria-label="Open music playground"
          title="Music playground"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="5.5" cy="17.5" r="2.5" />
            <circle cx="17.5" cy="15.5" r="2.5" />
            <path d="M8 17V5l12-2v12" />
          </svg>
        </button>

        {isMobileOpen && (
          <div
            className="fixed inset-0 z-[60]"
            style={{ backgroundColor: theme.colors.background }}
          >
            <button
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-4 right-4 z-[61] w-10 h-10 flex items-center justify-center rounded-full transition-colors duration-200"
              style={{
                border: `1px solid ${theme.colors.border}`,
                color: theme.colors.foreground,
              }}
              aria-label="Close music playground"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            {playground}
          </div>
        )}
      </div>
    </>
  );
}
