"use client";

import type { BlobDef } from "@/lib/blobConfig";

interface Connection {
  from: string;
  to: string;
  /** Index among all connections with the same from→to pair (for curving duplicates) */
  dupIndex: number;
  /** Total connections between this exact pair */
  dupTotal: number;
  color: string;
}

interface ConnectionLinesProps {
  chain: string[];
  blobs: BlobDef[];
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Temporary line while dragging: source blob position to cursor */
  dragLine: { fromId: string; toX: number; toY: number } | null;
}

/** Derive connection list from chain, counting duplicates between same pairs */
function deriveConnections(chain: string[], blobs: BlobDef[]): Connection[] {
  if (chain.length < 2) return [];

  const blobMap = new Map(blobs.map((b) => [b.id, b]));
  const connections: Connection[] = [];

  // Count occurrences of each directed pair
  const pairCounts = new Map<string, number>();

  for (let i = 0; i < chain.length - 1; i++) {
    const from = chain[i];
    const to = chain[i + 1];
    const key = `${from}→${to}`;
    const count = pairCounts.get(key) || 0;
    pairCounts.set(key, count + 1);

    const sourceBlob = blobMap.get(from);
    connections.push({
      from,
      to,
      dupIndex: count,
      dupTotal: 0, // filled in second pass
      color: sourceBlob?.colorSolid || "rgba(0,0,0,0.3)",
    });
  }

  // Fill in dupTotal
  for (const conn of connections) {
    const key = `${conn.from}→${conn.to}`;
    conn.dupTotal = pairCounts.get(key) || 1;
  }

  return connections;
}

/** Get blob center position in pixels relative to container */
function getBlobCenter(
  blob: BlobDef,
  container: HTMLDivElement
): { x: number; y: number } {
  const rect = container.getBoundingClientRect();
  return {
    x: (blob.x / 100) * rect.width,
    y: (blob.y / 100) * rect.height,
  };
}

/** Build a quadratic bezier path with curvature offset for duplicate lines */
function buildPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  dupIndex: number,
  dupTotal: number
): string {
  if (dupTotal <= 1 && dupIndex === 0) {
    // Straight line (slight curve for visual interest)
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    // Perpendicular offset
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const offset = 12;
    const cx = mx + (-dy / len) * offset;
    const cy = my + (dx / len) * offset;
    return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  }

  // Multiple lines between same pair: spread curves
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;

  // Spread from center: -1, 0, 1 for 3 lines, etc.
  const spread = dupIndex - (dupTotal - 1) / 2;
  const curvature = 40 * spread;
  const cx = mx + (-dy / len) * curvature;
  const cy = my + (dx / len) * curvature;

  return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
}

export default function ConnectionLines({
  chain,
  blobs,
  containerRef,
  dragLine,
}: ConnectionLinesProps) {
  const container = containerRef.current;
  if (!container) return null;

  const blobMap = new Map(blobs.map((b) => [b.id, b]));
  const connections = deriveConnections(chain, blobs);
  const rect = container.getBoundingClientRect();

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <defs>
        {/* Crayon texture filter */}
        <filter id="crayon" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="turbulence"
            baseFrequency="0.04"
            numOctaves="4"
            result="turbulence"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale="3"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Arrow markers for each blob color */}
        {blobs.map((blob) => (
          <marker
            key={`arrow-${blob.id}`}
            id={`arrow-${blob.id}`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={blob.colorSolid} />
          </marker>
        ))}

        {/* Generic arrow for drag line */}
        <marker
          id="arrow-drag"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(0,0,0,0.25)" />
        </marker>
      </defs>

      {/* Rendered connections */}
      {connections.map((conn, i) => {
        const fromBlob = blobMap.get(conn.from);
        const toBlob = blobMap.get(conn.to);
        if (!fromBlob || !toBlob) return null;

        const from = getBlobCenter(fromBlob, container);
        const to = getBlobCenter(toBlob, container);
        const path = buildPath(
          from.x,
          from.y,
          to.x,
          to.y,
          conn.dupIndex,
          conn.dupTotal
        );

        return (
          <path
            key={`${conn.from}-${conn.to}-${i}`}
            d={path}
            fill="none"
            stroke={conn.color}
            strokeWidth={3}
            strokeLinecap="round"
            markerEnd={`url(#arrow-${conn.from})`}
            filter="url(#crayon)"
          />
        );
      })}

      {/* Temporary drag line */}
      {dragLine && (() => {
        const fromBlob = blobMap.get(dragLine.fromId);
        if (!fromBlob) return null;
        const from = getBlobCenter(fromBlob, container);
        return (
          <line
            x1={from.x}
            y1={from.y}
            x2={dragLine.toX}
            y2={dragLine.toY}
            stroke="rgba(0,0,0,0.15)"
            strokeWidth={2}
            strokeDasharray="6 4"
            markerEnd="url(#arrow-drag)"
          />
        );
      })()}
    </svg>
  );
}
