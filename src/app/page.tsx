"use client";

import { ThemeProvider } from "@/themes/ThemeProvider";
import Hero from "@/components/sections/Hero";
import Testimonials from "@/components/sections/Testimonials";
import Bio from "@/components/sections/Bio";
import Contact from "@/components/sections/Contact";
import BlobPlayground from "@/components/BlobPlayground";

function Page() {
  return (
    <>
      <main>
        <Hero />
        <Testimonials />
        <Bio />
        <Contact />
      </main>

      <BlobPlayground />
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
