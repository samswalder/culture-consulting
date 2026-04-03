import type { ThemeConfig } from "./types";

/** Warm editorial — inspired by willl.xyz */
export const themeA: ThemeConfig = {
  id: "a",
  name: "Warm Editorial",
  layout: "scroll",
  useScrollReveal: true,
  colors: {
    background: "#fffffb",
    foreground: "#2b2f2a",
    accent: "#696c68",
    border: "rgba(43, 47, 42, 0.12)",
  },
  fonts: {
    heading: "var(--font-fraunces), Georgia, serif",
    body: "var(--font-geist-sans), system-ui, sans-serif",
  },
};
