"use client";

import { ThemeProvider } from "@/themes/ThemeProvider";
import Hero from "@/components/sections/Hero";
import Testimonials from "@/components/sections/Testimonials";
import Bio from "@/components/sections/Bio";
import Contact from "@/components/sections/Contact";
import AudioToggle from "@/components/AudioToggle";
import StyleSwitcher from "@/components/StyleSwitcher";
import BlobPlayground from "@/components/BlobPlayground";
import { useAudioTrigger } from "@/hooks/useAudioTrigger";

function Page() {
  const { initAudio, isMuted, toggleMute, isReady } = useAudioTrigger();

  return (
    <>
      <main>
        <Hero />
        <Testimonials />
        <Bio />
        <Contact />
      </main>

      <BlobPlayground />
      <StyleSwitcher />
      <AudioToggle
        isMuted={isMuted}
        isReady={isReady}
        onToggle={toggleMute}
        onInit={initAudio}
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
