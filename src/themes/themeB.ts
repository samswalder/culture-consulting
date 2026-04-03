import type { ThemeConfig } from "./types";

/** Terminal — inspired by bleedingedge.ai/about */
export const themeB: ThemeConfig = {
  id: "b",
  name: "Terminal",
  layout: "single-viewport",
  useScrollReveal: false,
  colors: {
    background: "#ffffff",
    foreground: "#171717",
    accent: "#737373",
    border: "rgba(0, 0, 0, 0.1)",
  },
  fonts: {
    heading: "var(--font-fraunces), Georgia, serif",
    body: "var(--font-geist-sans), system-ui, sans-serif",
  },
};
