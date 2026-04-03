"use client";

import { createContext, useContext, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { ThemeConfig } from "./types";
import { themes, defaultTheme } from "./index";

const ThemeContext = createContext<{ theme: ThemeConfig }>({
  theme: defaultTheme,
});

export function useTheme() {
  return useContext(ThemeContext);
}

function ThemeProviderInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const styleParam = searchParams.get("style") || "b";
  const theme = themes[styleParam] || defaultTheme;

  const isViewport = theme.layout === "single-viewport";

  return (
    <ThemeContext.Provider value={{ theme }}>
      <div
        className="min-h-screen"
        style={
          {
            "--background": theme.colors.background,
            "--foreground": theme.colors.foreground,
            "--accent": theme.colors.accent,
            "--border": theme.colors.border,
            backgroundColor: theme.colors.background,
            color: theme.colors.foreground,
            fontFamily: theme.fonts.body,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <ThemeProviderInner>{children}</ThemeProviderInner>
    </Suspense>
  );
}
