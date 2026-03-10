"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { sampleTestimonials } from "@/data/sample-testimonials";
import { CardsGrid } from "@/components/showcase/cards-grid";
import { Carousel } from "@/components/showcase/carousel";
import { TickerTape } from "@/components/showcase/ticker-tape";
import { FadeRotator } from "@/components/showcase/fade-rotator";
import { MinimalList } from "@/components/showcase/minimal-list";
import { MasonryGrid } from "@/components/showcase/masonry-grid";
import { VerticalMarquee } from "@/components/showcase/vertical-marquee";
import { SpotlightStack } from "@/components/showcase/spotlight-stack";
import {
  Grid3X3,
  GalleryHorizontal,
  MoveHorizontal,
  RotateCcw,
  List,
  Columns3,
  MoveVertical,
  Layers,
} from "lucide-react";

const styles = [
  { key: "cards", label: "Cards Grid", icon: Grid3X3 },
  { key: "carousel", label: "Carousel", icon: GalleryHorizontal },
  { key: "ticker", label: "Ticker Tape", icon: MoveHorizontal },
  { key: "fade", label: "Fade Rotator", icon: RotateCcw },
  { key: "minimal", label: "Minimal List", icon: List },
  { key: "masonry", label: "Masonry", icon: Columns3 },
  { key: "marquee", label: "Marquee", icon: MoveVertical },
  { key: "spotlight", label: "Spotlight", icon: Layers },
] as const;

type StyleKey = (typeof styles)[number]["key"];

const componentMap: Record<StyleKey, React.ComponentType<{ testimonials: typeof sampleTestimonials; autoplay?: boolean; speed?: "slow" | "normal" | "fast" }>> = {
  cards: CardsGrid,
  carousel: Carousel,
  ticker: TickerTape,
  fade: FadeRotator,
  minimal: MinimalList,
  masonry: MasonryGrid,
  marquee: VerticalMarquee,
  spotlight: SpotlightStack,
};

export function ShowcaseDemo() {
  const [active, setActive] = useState<StyleKey>("cards");
  const Component = componentMap[active];

  return (
    <section id="showcase" className="py-16 md:py-20">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center sm:mb-12"
        >
          <h2
            className="mb-4 font-bold tracking-tight"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)" }}
          >
            <span className="text-gradient">8 ways</span> to show off
          </h2>
          <p className="text-base text-muted-foreground sm:text-lg">
            Every style animates. Every style is free. Click to preview.
          </p>
        </motion.div>

        {/* Style tabs */}
        <div className="-mx-1 mb-8 flex flex-wrap justify-center gap-2 px-1 sm:mb-10">
          {styles.map((s) => (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 sm:px-4 ${
                active === s.key
                  ? "bg-gradient-primary text-primary-foreground shadow-lg"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <s.icon className="size-4" />
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>

        {/* Preview area */}
        <div className="min-h-[400px] rounded-2xl border border-border bg-card/30 p-4 sm:p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Component
                testimonials={sampleTestimonials}
                autoplay
                speed="normal"
              />
            </motion.div>
          </AnimatePresence>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          All styles · All free · No upsell on design
        </p>
      </div>
    </section>
  );
}
