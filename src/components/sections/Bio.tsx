"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useTheme } from "@/themes/ThemeProvider";
import { content } from "@/content";

function renderPhilosophyQuote(text: string) {
  const parts = text.split("sado");
  if (parts.length === 2) {
    return (
      <>
        {parts[0]}
        <em>sado</em>
        {parts[1]}
      </>
    );
  }
  return text;
}

export default function Bio() {
  const { theme } = useTheme();
  const compact = theme.layout === "single-viewport";

  const headingRef = useScrollReveal<HTMLHeadingElement>();
  const introRef = useScrollReveal<HTMLParagraphElement>({ delay: 0.2 });
  const clientsRef = useScrollReveal<HTMLDivElement>({ delay: 0.15 });
  const philosophyRef = useScrollReveal<HTMLDivElement>({ delay: 0.15 });

  const {
    sectionLabel,
    intro,
    clientsLabel,
    clients,
    philosophyIntro,
    philosophyQuotes,
  } = content.bio;

  if (compact) {
    // Intro + clients are shown in Hero for compact layout, philosophy hidden
    return null;
  }

  return (
    <section className="py-10 px-6">
      <div className="max-w-xl mx-auto">
        <h2
          ref={headingRef}
          className="text-xs uppercase tracking-widest mb-8"
          style={{ color: theme.colors.accent }}
        >
          {sectionLabel}
        </h2>

        <p ref={introRef} className="text-base leading-relaxed mb-7">
          {intro}
        </p>

        <div ref={clientsRef} className="mb-7">
          <p
            className="text-base leading-relaxed mb-3"
            style={{ color: theme.colors.accent }}
          >
            {clientsLabel}
          </p>
          <ul className="space-y-1.5 text-base leading-relaxed">
            {clients.map((client, i) => (
              <li key={i}>{client}</li>
            ))}
          </ul>
        </div>

        <div ref={philosophyRef}>
          <p className="text-base leading-relaxed mb-4">{philosophyIntro}</p>
          <blockquote
            className="pl-5 space-y-3"
            style={{ borderLeft: `2px solid ${theme.colors.border}` }}
          >
            {philosophyQuotes.map((quote, i) => (
              <p key={i} className="text-base leading-relaxed italic">
                {renderPhilosophyQuote(quote)}
              </p>
            ))}
          </blockquote>
        </div>
      </div>
    </section>
  );
}
