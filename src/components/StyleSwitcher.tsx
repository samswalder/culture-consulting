"use client";

import { useTheme } from "@/themes/ThemeProvider";
import { themes } from "@/themes";

export default function StyleSwitcher() {
  const { theme } = useTheme();

  return (
    <div
      className="fixed top-4 right-4 z-50 flex gap-1 rounded-full px-1 py-1"
      style={{
        backgroundColor: theme.colors.background,
        border: `1px solid ${theme.colors.border}`,
      }}
    >
      {Object.values(themes).map((t) => (
        <a
          key={t.id}
          href={`?style=${t.id}`}
          className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-medium transition-all duration-200"
          style={{
            backgroundColor:
              t.id === theme.id ? theme.colors.foreground : "transparent",
            color:
              t.id === theme.id ? theme.colors.background : theme.colors.accent,
          }}
          title={t.name}
        >
          {t.id.toUpperCase()}
        </a>
      ))}
    </div>
  );
}
