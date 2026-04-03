"use client";

import { useCallback, useEffect, useState } from "react";
import { audioManager } from "@/lib/audioManager";
import { synthEngine } from "@/lib/synthEngine";
import { drumMachine } from "@/lib/drumMachine";

/**
 * Hook for triggering audio on scroll or interaction events.
 *
 * Usage:
 *   const { triggerSound, initAudio, isMuted, toggleMute } = useAudioTrigger();
 *
 * Call initAudio() on first user interaction (click/tap) to satisfy
 * browser autoplay policies. Then use triggerSound("name") to play.
 */
export function useAudioTrigger() {
  const [isMuted, setIsMuted] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const initAudio = useCallback(async () => {
    await audioManager.init();
    setIsReady(true);
  }, []);

  const loadSound = useCallback(async (name: string, src: string) => {
    await audioManager.load(name, src);
  }, []);

  const triggerSound = useCallback(
    (name: string, options?: { volume?: number; loop?: boolean }) => {
      audioManager.play(name, options);
    },
    []
  );

  const stopSound = useCallback((name: string) => {
    audioManager.stop(name);
  }, []);

  const toggleMute = useCallback(() => {
    const newMuted = !audioManager.isMuted();
    audioManager.setMuted(newMuted);
    synthEngine.setMuted(newMuted);
    drumMachine.setMuted(newMuted);
    setIsMuted(newMuted);
  }, []);

  return { initAudio, loadSound, triggerSound, stopSound, isMuted, toggleMute, isReady };
}
