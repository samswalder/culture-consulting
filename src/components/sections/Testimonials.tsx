"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useTheme } from "@/themes/ThemeProvider";
import { content } from "@/content";

function TestimonialCard({
  testimonial,
  index,
  compact,
}: {
  testimonial: (typeof content.testimonials.items)[number];
  index: number;
  compact: boolean;
}) {
  const ref = useScrollReveal<HTMLQuoteElement>({
    delay: index * 0.15,
  });

  if (compact) {
    return (
      <blockquote ref={ref} className="mb-3 last:mb-0">
        <p className="text-sm leading-relaxed mb-1">
          &ldquo;{testimonial.quote}&rdquo;
        </p>
        <footer className="text-sm" style={{ color: "var(--accent)" }}>
          {testimonial.name}, {testimonial.title}
        </footer>
      </blockquote>
    );
  }

  return (
    <blockquote ref={ref} className="mb-10 last:mb-0">
      <p className="text-base sm:text-lg leading-relaxed mb-3 italic">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
      <footer style={{ color: "var(--accent)" }}>
        <span className="font-medium" style={{ color: "var(--foreground)" }}>
          {testimonial.name}
        </span>
        <span className="mx-2">&mdash;</span>
        <span>{testimonial.title}</span>
      </footer>
    </blockquote>
  );
}

export default function Testimonials() {
  const { theme } = useTheme();
  const compact = theme.layout === "single-viewport";
  const headingRef = useScrollReveal<HTMLHeadingElement>();

  return (
    <section
      className={compact ? "py-3 px-6" : "py-10 px-6"}
    >
      <div
        className={compact ? "max-w-3xl pt-3" : "max-w-xl mx-auto"}
        style={
          compact
            ? { borderTop: `1px solid ${theme.colors.border}` }
            : undefined
        }
      >
        <h2
          ref={headingRef}
          className={
            compact
              ? "text-sm leading-relaxed mb-3"
              : "text-xs uppercase tracking-widest mb-10"
          }
          style={{
            color: theme.colors.accent,
          }}
        >
          {content.testimonials.sectionLabel}
        </h2>

        {content.testimonials.items.map((testimonial, i) => (
          <TestimonialCard
            key={i}
            testimonial={testimonial}
            index={i}
            compact={compact}
          />
        ))}
      </div>
    </section>
  );
}
