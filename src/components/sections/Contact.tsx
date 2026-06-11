"use client";

import { useState, useEffect, useRef } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useTheme } from "@/themes/ThemeProvider";
import { content } from "@/content";
import { synthEngine } from "@/lib/synthEngine";
import { drumMachine } from "@/lib/drumMachine";

const { email, subject, body, heading, description, buttonText } =
  content.contact;

const MAILTO = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

/** Random pastel background for the popup */
function randomPastel(): string {
  const h = Math.floor(Math.random() * 360);
  const s = 55 + Math.random() * 25;
  const l = 78 + Math.random() * 10;
  return `hsl(${h}, ${s.toFixed(0)}%, ${l.toFixed(0)}%)`;
}

export default function Contact() {
  const { theme } = useTheme();
  const compact = theme.layout === "single-viewport";

  const headingRef = useScrollReveal<HTMLHeadingElement>();
  const ctaRef = useScrollReveal<HTMLDivElement>({ delay: 0.3 });

  const [showPopup, setShowPopup] = useState(false);
  const [copied, setCopied] = useState(false);
  const [popupColor, setPopupColor] = useState("#e0d4f5");
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup on outside click
  useEffect(() => {
    if (!showPopup) return;
    const handleClick = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setShowPopup(false);
      }
    };
    document.addEventListener("pointerdown", handleClick);
    return () => document.removeEventListener("pointerdown", handleClick);
  }, [showPopup]);

  const handleGetInTouch = (e: React.MouseEvent) => {
    e.preventDefault();
    setPopupColor(randomPastel());
    setCopied(false);
    setShowPopup((prev) => !prev);
  };

  const handleCopyEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    await navigator.clipboard.writeText(email);
    setCopied(true);

    // Em11 chord + drum break
    if (!synthEngine.isInitialized()) await synthEngine.init();
    if (!drumMachine.isInitialized()) await drumMachine.init();
    synthEngine.playChord("Em11", 2);

    setTimeout(() => setCopied(false), 2000);
  };

  if (compact) {
    // CTA rendered inline in Hero compact via ContactCTA
    return null;
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
