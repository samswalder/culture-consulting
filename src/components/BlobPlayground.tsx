"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useTheme } from "@/themes/ThemeProvider";
import { blobs as blobDefs, type BlobDef } from "@/lib/blobConfig";
import { synthEngine } from "@/lib/synthEngine";
import { drumMachine } from "@/lib/drumMachine";
import BlobCircle from "./BlobCircle";
import ConnectionLines from "./ConnectionLines";

/** Generate a random soft pastel color */
function randomPastel(): { color: string; colorSolid: string } {
  const h = Math.floor(Math.random() * 360);
  const s = 55 + Math.random() * 30; // 55-85%
  const l = 68 + Math.random() * 12; // 68-80%
  return {
    color: `hsla(${h}, ${s.toFixed(0)}%, ${l.toFixed(0)}%, 0.30)`,
    colorSolid: `hsla(${h}, ${s.toFixed(0)}%, ${l.toFixed(0)}%, 0.70)`,
  };
}

/** Randomize blob positions and colors on each page load */
function randomizeBlobs(defs: BlobDef[]): BlobDef[] {
  return defs.map((blob) => {
    const { color, colorSolid } = randomPastel();
    return {
      ...blob,
      x: blob.x + (Math.random() - 0.5) * 14,
      y: blob.y + (Math.random() - 0.5) * 10,
      color,
      colorSolid,
    };
  });
}

/** Check if a point is within a blob's hit area */
function hitTest(
  clientX: number,
  clientY: number,
  container: HTMLDivElement,
  blobs: BlobDef[]
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

/** Whether the linear chain should loop (easy toggle for later) */
const LOOP_PROGRESSION = false;

/** Chord duration in seconds — 4 beats at 125 BPM */
const CHORD_DURATION = (60 / 125) * 4; // 1.92s

export default function BlobPlayground({
  musicMode = false,
  onToggleMusicMode,
}: {
  musicMode?: boolean;
  onToggleMusicMode?: (mode: boolean) => void;
}) {
  const { theme } = useTheme();

  // Randomize positions on the client only (avoids SSR hydration mismatch)
  const [blobs, setBlobs] = useState(blobDefs);
  useEffect(() => {
    setBlobs(randomizeBlobs(blobDefs));
  }, []);

  const [chain, setChain] = useState<string[]>([]);
  const [dragFrom, setDragFrom] = useState<string | null>(null);
  const [dragLine, setDragLine] = useState<{
    fromId: string;
    toX: number;
    toY: number;
  } | null>(null);
  const [justConnectedId, setJustConnectedId] = useState<string | null>(null);
  const [playingBlobId, setPlayingBlobId] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  const blobClickCount = useRef(0);

  // Separate refs for desktop and mobile containers
  const desktopRef = useRef<HTMLDivElement>(null);
  const mobileRef = useRef<HTMLDivElement>(null);
  // Tracks which container the current pointer interaction is happening in
  const activeContainerRef = useRef<HTMLDivElement | null>(null);

  const pointerDownTime = useRef(0);
  const pointerDownPos = useRef({ x: 0, y: 0 });
  const dragFromRef = useRef<string | null>(null);
  const chainRef = useRef<string[]>([]);
  const blobsRef = useRef(blobs);
  const singleChordTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Blob ID → chord name lookup
  const blobChordMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const b of blobs) {
      map[b.id] = b.chord;
    }
    return map;
  }, [blobs]);

  // Keep refs in sync with state
  useEffect(() => {
    blobsRef.current = blobs;
  }, [blobs]);
  useEffect(() => {
    dragFromRef.current = dragFrom;
  }, [dragFrom]);
  useEffect(() => {
    chainRef.current = chain;
  }, [chain]);

  // Clear state when exiting music mode on mobile
  useEffect(() => {
    if (!musicMode) {
      setChain([]);
      setDragFrom(null);
      setDragLine(null);
      setPlayingBlobId(null);
      if (synthEngine.isInitialized()) synthEngine.stopProgression();
      if (drumMachine.isInitialized() && drumMachine.isRunning())
        drumMachine.stop();
    }
  }, [musicMode]);

  // Prevent body scroll when mobile music mode is active
  useEffect(() => {
    if (musicMode) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [musicMode]);

  // Set up progression callbacks
  useEffect(() => {
    synthEngine.onChordStart = (blobId: string) => setPlayingBlobId(blobId);
    synthEngine.onChordEnd = () => {}; // next onChordStart handles the switch
    synthEngine.onProgressionEnd = () => {
      setPlayingBlobId(null);
      drumMachine.stop();
    };
  }, []);

  const activeBlobs = new Set(chain);

  // Clear pop animation flag after it plays
  useEffect(() => {
    if (!justConnectedId) return;
    const timer = setTimeout(() => setJustConnectedId(null), 500);
    return () => clearTimeout(timer);
  }, [justConnectedId]);

  // Initialize audio engines on first user gesture
  const ensureAudio = useCallback(async () => {
    if (!synthEngine.isInitialized()) await synthEngine.init();
    if (!drumMachine.isInitialized()) await drumMachine.init();
  }, []);

  /** Play a single chord on click (not tied to progression) */
  const playSingleChord = useCallback(
    (blobId: string) => {
      const chord = blobChordMap[blobId];
      if (!chord) return;

      // Clear any previous single-chord timer
      if (singleChordTimer.current) clearTimeout(singleChordTimer.current);

      synthEngine.playChord(chord, CHORD_DURATION);
      setPlayingBlobId(blobId);

      singleChordTimer.current = setTimeout(() => {
        // Only clear if still showing this blob (progression may have taken over)
        setPlayingBlobId((prev) => (prev === blobId ? null : prev));
        singleChordTimer.current = null;
      }, CHORD_DURATION * 1000);
    },
    [blobChordMap]
  );

  // --- Pointer move: track drag line and detect hover targets ---
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragFromRef.current || !activeContainerRef.current) return;
      const rect = activeContainerRef.current.getBoundingClientRect();
      setDragLine({
        fromId: dragFromRef.current,
        toX: e.clientX - rect.left,
        toY: e.clientY - rect.top,
      });
    };

    const onUp = (e: PointerEvent) => {
      const source = dragFromRef.current;
      const container = activeContainerRef.current;

      if (!source || !container) {
        setDragFrom(null);
        setDragLine(null);
        return;
      }

      const elapsed = Date.now() - pointerDownTime.current;
      const dx = e.clientX - pointerDownPos.current.x;
      const dy = e.clientY - pointerDownPos.current.y;
      const moveDist = Math.sqrt(dx * dx + dy * dy);
      const isClick = elapsed < 300 && moveDist < 8;

      const targetId = hitTest(
        e.clientX,
        e.clientY,
        container,
        blobsRef.current
      );

      if (isClick && targetId === source) {
        // Click on a blob — play its chord
        playSingleChord(source);

        // If in chain, deactivate it + stop progression + stop drums
        const prev = chainRef.current;
        const lastIndex = prev.lastIndexOf(source);
        if (lastIndex !== -1) {
          setChain(prev.slice(0, lastIndex));
          synthEngine.stopProgression();
          drumMachine.stop();
        }
      } else if (targetId && targetId !== source) {
        // Dragged to a different blob — create connection
        const prev = chainRef.current;
        const isExtending = prev.length > 0 && prev[prev.length - 1] === source;

        let newChain: string[];
        if (prev.length === 0) {
          newChain = [source, targetId];
        } else if (isExtending) {
          newChain = [...prev, targetId];
        } else {
          newChain = [source, targetId];
        }

        // Detect loop: last blob matches the first blob in the chain
        const isLoop =
          newChain.length > 2 && newChain[newChain.length - 1] === newChain[0];

        setChain(newChain);
        setJustConnectedId(targetId);

        // Build chord map from current blobs
        const chordMap: Record<string, string> = {};
        for (const b of blobsRef.current) {
          chordMap[b.id] = b.chord;
        }

        if (isExtending && isLoop) {
          // Closing a loop — don't add duplicate, just enable looping
          synthEngine.enableLoop();
          if (!drumMachine.isRunning()) drumMachine.start();
        } else if (isExtending) {
          // Smoothly append — don't restart current playback
          synthEngine.appendToProgression(targetId, chordMap);
          if (!drumMachine.isRunning()) drumMachine.start();
        } else {
          // Brand new chain — start fresh
          synthEngine.playProgression(newChain, chordMap, {
            loop: isLoop,
            chordDuration: CHORD_DURATION,
          });
          drumMachine.start();
        }
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
  }, [playSingleChord]);

  // --- Blob pointer down: start drag + init audio + determine container ---
  const handleBlobPointerDown = useCallback(
    (id: string, e: React.PointerEvent) => {
      e.preventDefault();
      ensureAudio();

      // Determine which container this interaction is in
      const target = e.currentTarget as HTMLElement;
      if (desktopRef.current?.contains(target)) {
        activeContainerRef.current = desktopRef.current;
      } else if (mobileRef.current?.contains(target)) {
        activeContainerRef.current = mobileRef.current;
      }

      pointerDownTime.current = Date.now();
      pointerDownPos.current = { x: e.clientX, y: e.clientY };
      setDragFrom(id);

      // Tooltip: show on first click, dismiss 2s after second click
      if (!tooltipDismissed) {
        blobClickCount.current += 1;
        if (blobClickCount.current === 1) {
          setShowTooltip(true);
        } else if (blobClickCount.current === 2) {
          setTimeout(() => {
            setShowTooltip(false);
            setTooltipDismissed(true);
          }, 2000);
        }
      }
    },
    [ensureAudio, tooltipDismissed]
  );

  // Don't render for non-compact themes
  if (theme.layout !== "single-viewport") return null;

  const tooltipStyle = {
    color: theme.colors.accent,
    fontSize: "0.75rem" as const,
    opacity: tooltipDismissed ? 0 : 0.6,
    transition: "opacity 0.5s ease-out",
  };
  const tooltipClass =
    "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none";

  return (
    <>
      {/* ---- Desktop: fixed right side ---- */}
      <div className="hidden md:block fixed top-0 right-0 w-[40vw] h-screen z-10">
        <div
          ref={desktopRef}
          className="relative w-full h-full"
          style={{ pointerEvents: "none" }}
        >
          <ConnectionLines
            chain={chain}
            blobs={blobs}
            containerRef={desktopRef}
            dragLine={dragLine}
          />
          {showTooltip && (
            <div className={tooltipClass} style={tooltipStyle}>
              click and drag
            </div>
          )}
          {blobs.map((blob) => (
            <BlobCircle
              key={blob.id}
              blob={blob}
              isActive={activeBlobs.has(blob.id)}
              isDragSource={dragFrom === blob.id}
              justConnected={justConnectedId === blob.id}
              isPlaying={playingBlobId === blob.id}
              onPointerDown={handleBlobPointerDown}
            />
          ))}
        </div>
      </div>

      {/* ---- Mobile: always-visible blobs, decorative ↔ interactive ---- */}
      <div
        className="md:hidden fixed inset-0"
        style={{ zIndex: musicMode ? 45 : 0 }}
      >
        <div
          ref={mobileRef}
          className="relative w-full h-full"
          style={{ pointerEvents: "none" }}
        >
          <ConnectionLines
            chain={musicMode ? chain : []}
            blobs={blobs}
            containerRef={mobileRef}
            dragLine={musicMode ? dragLine : null}
          />
          {musicMode && showTooltip && (
            <div className={tooltipClass} style={tooltipStyle}>
              tap and drag
            </div>
          )}
          {blobs.map((blob) => (
            <BlobCircle
              key={blob.id}
              blob={blob}
              isActive={musicMode ? activeBlobs.has(blob.id) : false}
              isDragSource={musicMode ? dragFrom === blob.id : false}
              justConnected={musicMode ? justConnectedId === blob.id : false}
              isPlaying={musicMode ? playingBlobId === blob.id : false}
              onPointerDown={handleBlobPointerDown}
              sizeScale={musicMode ? 0.85 : 0.6}
              interactive={musicMode}
            />
          ))}
        </div>
      </div>

      {/* ---- Mobile: music mode toggle button ---- */}
      <button
        className="md:hidden fixed bottom-6 right-6 z-50 w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-sm transition-all duration-300"
        onClick={() => {
          ensureAudio(); // Init AudioContext on first mobile gesture
          onToggleMusicMode?.(!musicMode);
        }}
        style={{
          border: `1px solid ${theme.colors.border}`,
          backgroundColor: `${theme.colors.background}cc`,
          color: theme.colors.accent,
        }}
        aria-label={
          musicMode ? "Close music playground" : "Open music playground"
        }
      >
        {musicMode ? (
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
        ) : (
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
        )}
      </button>
    </>
  );
}
