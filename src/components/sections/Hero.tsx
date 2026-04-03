"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useTheme } from "@/themes/ThemeProvider";
import { content } from "@/content";

export default function Hero() {
  const { theme } = useTheme();
  const compact = theme.layout === "single-viewport";

  const headlineRef = useScrollReveal<HTMLHeadingElement>({ delay: 0.2 });
  const subtitleRef = useScrollReveal<HTMLParagraphElement>({ delay: 0.5 });
  const clientsRef = useScrollReveal<HTMLDivElement>({ delay: 0.3 });

  if (compact) {
    return (
      <section className="py-8 px-6">
        <div className="max-w-3xl">
          <p
            ref={headlineRef}
            className="text-sm leading-relaxed mb-6"
          >
            {content.hero.introText}
          </p>

          <div ref={clientsRef}>
            <p
              className="text-sm leading-relaxed mb-3"
              style={{ color: theme.colors.accent }}
            >
              {content.bio.clientsLabel}
            </p>
            <ul className="space-y-1 text-sm leading-relaxed list-none">
              {content.bio.clients.map((client, i) => (
                <li key={i} className="flex">
                  <span className="shrink-0">&mdash;&nbsp;</span>
                  <span>{client}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex items-center justify-center min-h-[70vh] py-10 px-6">
      <div className="max-w-xl mx-auto text-center">
        <h1
          ref={headlineRef}
          className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-5"
          style={{ fontFamily: theme.fonts.heading }}
        >
          {content.hero.headline}
        </h1>

        <p
          ref={subtitleRef}
          className="text-base sm:text-lg leading-relaxed max-w-md mx-auto"
          style={{ color: theme.colors.accent }}
        >
          {content.hero.subheadline}
        </p>
      </div>
    </section>
  );
}
