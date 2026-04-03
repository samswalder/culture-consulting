"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useTheme } from "@/themes/ThemeProvider";

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealOptions {
  /** Delay before animation starts (seconds) */
  delay?: number;
  /** Animation duration (seconds) */
  duration?: number;
  /** Starting Y offset in pixels */
  yOffset?: number;
  /** Trigger position: "top center" means animation starts when top of element hits center of viewport */
  start?: string;
  /** Called when element enters viewport */
  onEnter?: () => void;
}

export function useScrollReveal<T extends HTMLElement>(
  options: ScrollRevealOptions = {}
) {
  const ref = useRef<T>(null);
  const { theme } = useTheme();

  const {
    delay = 0,
    duration = 0.8,
    yOffset = 40,
    start = "top 80%",
    onEnter,
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If theme disables scroll reveal, just show immediately
    if (!theme.useScrollReveal) {
      gsap.set(el, { opacity: 1, y: 0 });
      onEnter?.();
      return;
    }

    gsap.set(el, { opacity: 0, y: yOffset });

    const trigger = ScrollTrigger.create({
      trigger: el,
      start,
      once: true,
      onEnter: () => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: "power2.out",
        });
        onEnter?.();
      },
    });

    return () => {
      trigger.kill();
    };
  }, [delay, duration, yOffset, start, onEnter, theme.useScrollReveal]);

  return ref;
}
