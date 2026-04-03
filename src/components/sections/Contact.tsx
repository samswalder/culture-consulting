"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useTheme } from "@/themes/ThemeProvider";
import { content } from "@/content";

const { email, subject, body, heading, description, buttonText } =
  content.contact;

const MAILTO = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

export default function Contact() {
  const { theme } = useTheme();
  const compact = theme.layout === "single-viewport";

  const headingRef = useScrollReveal<HTMLHeadingElement>();
  const ctaRef = useScrollReveal<HTMLDivElement>({ delay: 0.3 });

  if (compact) {
    return (
      <section className="py-3 px-6">
        <div
          className="max-w-3xl pt-3"
          style={{ borderTop: `1px solid ${theme.colors.border}` }}
        >
          <p ref={headingRef} className="text-sm leading-relaxed mb-2">
            {description}
          </p>
          <a
            href={MAILTO}
            className="text-sm underline underline-offset-2 transition-opacity hover:opacity-70"
          >
            {buttonText} &rarr;
          </a>
        </div>
      </section>
    );
  }

  return (
    <section className="flex items-center justify-center min-h-[50vh] py-10 px-6">
      <div className="max-w-xl mx-auto text-center">
        <h2
          ref={headingRef}
          className="text-xl sm:text-2xl font-bold tracking-tight mb-4"
          style={{ fontFamily: theme.fonts.heading }}
        >
          {heading}
        </h2>

        <div ref={ctaRef}>
          <p className="mb-7 text-base" style={{ color: theme.colors.accent }}>
            {description}
          </p>

          <a
            href={MAILTO}
            className="inline-block px-6 py-3 rounded-full text-base transition-colors duration-300"
            style={{
              border: `1px solid ${theme.colors.border}`,
              color: theme.colors.foreground,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.colors.foreground;
              e.currentTarget.style.color = theme.colors.background;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = theme.colors.foreground;
            }}
          >
            {buttonText}
          </a>
        </div>
      </div>
    </section>
  );
}
