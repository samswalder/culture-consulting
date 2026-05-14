"use client";

import { useState, useEffect, useRef } from "react";
import { content } from "@/content";
import { synthEngine } from "@/lib/synthEngine";
import { drumMachine } from "@/lib/drumMachine";

const { email, description, buttonText } = content.contact;

function randomPastel(): string {
  const h = Math.floor(Math.random() * 360);
  const s = 55 + Math.random() * 25;
  const l = 78 + Math.random() * 10;
  return `hsl(${h}, ${s.toFixed(0)}%, ${l.toFixed(0)}%)`;
}

export default function ContactCTA() {
  const [showPopup, setShowPopup] = useState(false);
  const [copied, setCopied] = useState(false);
  const [popupColor, setPopupColor] = useState("#e0d4f5");
  const popupRef = useRef<HTMLDivElement>(null);

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

    if (!synthEngine.isInitialized()) await synthEngine.init();
    if (!drumMachine.isInitialized()) await drumMachine.init();
    synthEngine.playChord("Em11", 2);

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <p className="text-sm leading-relaxed mb-2">{description}</p>
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
    </>
  );
}
