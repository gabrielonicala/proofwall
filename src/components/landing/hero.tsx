"use client";

import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Carousel } from "@/components/showcase/carousel";
import { sampleTestimonials } from "@/data/sample-testimonials";
import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden pt-28 pb-4 sm:pt-32 sm:pb-6">
      {/* Gradient mesh background – masked to fade out at bottom */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          maskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, black 50%, transparent 100%)",
        }}
      >
        <div
          className="absolute left-[-8rem] top-1/4 size-96 rounded-full bg-primary/15 blur-[120px] animate-gradient-mesh"
          style={{ animation: "gradient-mesh 22s ease-in-out infinite, mesh-breathe 8s ease-in-out infinite" }}
        />
        <div
          className="absolute right-0 top-1/3 size-80 rounded-full bg-secondary/15 blur-[100px] animate-gradient-mesh"
          style={{ animation: "gradient-mesh 18s ease-in-out infinite reverse, mesh-breathe 6s ease-in-out infinite -3s" }}
        />
        <div
          className="absolute bottom-1/4 left-1/3 size-72 rounded-full bg-primary/10 blur-[80px] animate-gradient-mesh"
          style={{ animation: "gradient-mesh 25s ease-in-out infinite -8s, mesh-breathe 10s ease-in-out infinite -5s" }}
        />
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Grain overlay – inside masked container so it fades with everything else */}
        <div className="grain absolute inset-0 pointer-events-none" />
      </div>

      <div className="container-wide relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Beta badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-success" />
            Now in public beta — free forever plan
          </div>

          <h1
            className="font-display mx-auto max-w-4xl leading-[0.95] tracking-tight"
            style={{ fontSize: "clamp(2.75rem, 7.5vw, 6.5rem)" }}
          >
            Testimonials
            <br />
            that <span className="text-gradient">convert.</span>
          </h1>

          <p className="mx-auto mb-8 mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl">
            Collect stunning social proof. Deploy it strategically.
            <br className="hidden md:block" />
            Watch your conversions climb.
          </p>

          {/* CTAs */}
          <div className="mb-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex h-12 items-center gap-1 rounded-lg bg-gradient-primary px-8 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Start Free
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#showcase"
              className="inline-flex h-12 items-center gap-1 rounded-lg border border-border/50 bg-transparent px-8 text-base font-medium transition-colors hover:bg-muted/50"
            >
              <Play className="size-4" />
              See it in action
            </a>
          </div>

          <p className="mb-24 text-xs text-muted-foreground sm:mb-32">
            Free forever · No credit card · 2 minute setup
          </p>
        </motion.div>

        {/* Live demo preview */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto mt-12 max-w-2xl sm:mt-16"
        >
          <div className="rounded-2xl border border-border/50 bg-card/40 p-4 shadow-2xl backdrop-blur-sm sm:p-6">
            {/* Browser chrome */}
            <div className="mb-4 flex items-center gap-2 px-1">
              <div className="size-2.5 rounded-full bg-destructive/60" />
              <div className="size-2.5 rounded-full bg-accent/60" />
              <div className="size-2.5 rounded-full bg-success/60" />
              <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                yoursite.com/pricing
              </span>
            </div>
            <Carousel
              testimonials={sampleTestimonials.slice(0, 5)}
              autoplay
              speed="fast"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
