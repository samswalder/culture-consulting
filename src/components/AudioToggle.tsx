"use client";

import { useTheme } from "@/themes/ThemeProvider";

interface AudioToggleProps {
  isMuted: boolean;
  isReady: boolean;
  onToggle: () => void;
  onInit: () => void;
}

export default function AudioToggle({
  isMuted,
  isReady,
  onToggle,
  onInit,
}: AudioToggleProps) {
  const { theme } = useTheme();

  return (
    <button
      onClick={isReady ? onToggle : onInit}
      className="fixed bottom-6 right-6 z-50 w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-sm transition-colors duration-200"
      style={{
        border: `1px solid ${theme.colors.border}`,
        backgroundColor: `${theme.colors.background}cc`,
        color: theme.colors.accent,
      }}
      aria-label={
        !isReady ? "Enable audio" : isMuted ? "Unmute audio" : "Mute audio"
      }
      title={
        !isReady ? "Enable audio" : isMuted ? "Unmute audio" : "Mute audio"
      }
    >
      {!isReady || isMuted ? (
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
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <line x1="23" y1="9" x2="17" y2="15" />
          <line x1="17" y1="9" x2="23" y2="15" />
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
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      )}
    </button>
  );
}
