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
    return (
      <section className="py-3 px-6">
        <div
          className="max-w-3xl pt-3"
          style={{ borderTop: `1px solid ${theme.colors.border}` }}
        >
          <p ref={headingRef} className="text-sm leading-relaxed mb-2">
            {description}
          </p>
          <div className="relative inline-block">
            <button
              onClick={handleGetInTouch}
              className="text-sm underline underline-offset-2 transition-opacity hover:opacity-70 cursor-pointer"
            >
              {buttonText} &rarr;
            </button>

            {showPopup && (
              <div
                ref={popupRef}
                className="absolute left-0 bottom-full mb-2 px-4 py-3 rounded-xl shadow-lg z-50"
                style={{
                  backgroundColor: popupColor,
                  color: "#1a1a1a",
                  animation: "popIn 0.2s ease-out",
                }}
              >
                <p className="text-xs font-medium mb-1 whitespace-nowrap opacity-60">
                  Say hi:
                </p>
                <button
                  onClick={handleCopyEmail}
                  className="text-sm font-medium whitespace-nowrap hover:opacity-70 transition-opacity cursor-pointer"
                >
                  {email}
                </button>
                {copied && (
                  <span
                    className="absolute left-1/2 text-xs font-medium whitespace-nowrap pointer-events-none"
                    style={{
                      color: "#1a1a1a",
                      opacity: 0.7,
                      animation: "driftUp 2s ease-out forwards",
                      transform: "translateX(-50%)",
                    }}
                  >
                    Copied to clipboard!
                  </span>
                )}
                <style>{`
                  @keyframes popIn {
                    from { opacity: 0; transform: scale(0.9) translateY(4px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                  }
                  @keyframes driftUp {
                    0% { opacity: 0.8; transform: translateX(-50%) translateY(0); }
                    70% { opacity: 0.6; }
                    100% { opacity: 0; transform: translateX(-50%) translateY(-24px); }
                  }
                `}</style>
              </div>
            )}
          </div>
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
