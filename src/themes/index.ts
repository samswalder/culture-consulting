import type { ThemeConfig } from "./types";
import { themeB } from "./themeB";

export const themes: Record<string, ThemeConfig> = {
  b: themeB,
};

export const defaultTheme = themeB;

export type { ThemeConfig };
