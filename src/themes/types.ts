export interface ThemeConfig {
  id: string;
  name: string;
  /** "scroll" = normal scrolling page, "single-viewport" = everything fits in one screen */
  layout: "scroll" | "single-viewport";
  /** Whether to use scroll-triggered reveal animations */
  useScrollReveal: boolean;
  colors: {
    background: string;
    foreground: string;
    accent: string;
    border: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}
