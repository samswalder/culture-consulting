"use client";

import { useState } from "react";
import { ThemeProvider } from "@/themes/ThemeProvider";
import Hero from "@/components/sections/Hero";
import Testimonials from "@/components/sections/Testimonials";
import Bio from "@/components/sections/Bio";
import Contact from "@/components/sections/Contact";
import BlobPlayground from "@/components/BlobPlayground";

function Page() {
  const [musicMode, setMusicMode] = useState(false);

  return (
    <>
      <main
        className="relative z-10 transition-opacity duration-500 ease-in-out"
        style={{ opacity: musicMode ? 0.2 : 1 }}
      >
        <Hero />
        <Testimonials />
        <Bio />
        <Contact />
      </main>

      <BlobPlayground
        musicMode={musicMode}
        onToggleMusicMode={setMusicMode}
      />
    </>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <Page />
    </ThemeProvider>
  );
}
