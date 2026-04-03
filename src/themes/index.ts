import type { ThemeConfig } from "./types";
import { themeA } from "./themeA";
import { themeB } from "./themeB";

export const themes: Record<string, ThemeConfig> = {
  a: themeA,
  b: themeB,
};

export const defaultTheme = themeA;

export type { ThemeConfig };
