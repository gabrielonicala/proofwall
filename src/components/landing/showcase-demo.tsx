"use client";

import { useState, useRef, useEffect } from "react";
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
import { Orbit } from "@/components/showcase/orbit";
import {
  Grid3X3,
  GalleryHorizontal,
  MoveHorizontal,
  RotateCcw,
  List,
  Columns3,
  MoveVertical,
  Layers,
  Globe,
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
  { key: "orbit", label: "Orbit", icon: Globe },
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
  orbit: Orbit,
};

export function ShowcaseDemo() {
  const [active, setActive] = useState<StyleKey>("cards");
  const Component = componentMap[active];
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hasInitRef = useRef(false);
  const measureRef = useRef<HTMLDivElement>(null);
  const [splitTabs, setSplitTabs] = useState(false);

  // Detect if all style tabs fit in a single row
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      setSplitTabs(el.scrollWidth > el.clientWidth);
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Smooth container height via ResizeObserver + direct DOM updates (no React re-renders)
  useEffect(() => {
    const content = contentRef.current;
    const container = containerRef.current;
    if (!content || !container) return;

    const ro = new ResizeObserver(() => {
      const h = content.getBoundingClientRect().height;
      const style = getComputedStyle(container);
      const py = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const total = Math.max(h + py, 400);

      if (!hasInitRef.current) {
        container.style.height = `${total}px`;
        hasInitRef.current = true;
        requestAnimationFrame(() => {
          container.style.transition = "height 0.2s ease-out";
        });
      } else {
        container.style.height = `${total}px`;
      }
    });

    ro.observe(content);
    return () => ro.disconnect();
  }, []);

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
            className="font-display mb-4 tracking-tight"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}
          >
            <span className="text-gradient"><span className="sm:hidden">8 ways</span><span className="hidden sm:inline">9 ways</span></span> to show off
          </h2>
          <p className="text-base text-muted-foreground sm:text-lg">
            Every style animates. Every style is free.{" "}
            <br className="sm:hidden" />
            Click to preview.
          </p>
        </motion.div>

        {/* Style tabs — dynamically split into 4/5 rows when they don't fit in one line */}
        <div className="relative -mx-1 mb-8 px-1 sm:mb-10">
          {/* Hidden single-row measurement — always flex-nowrap so scrollWidth reveals overflow */}
          <div
            ref={measureRef}
            className="pointer-events-none invisible absolute inset-x-0 flex flex-nowrap gap-2 overflow-hidden"
            aria-hidden
          >
            {styles.map((s) => (
              <span
                key={s.key}
                className={`items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium sm:px-4 ${
                  s.key === "masonry" ? "hidden sm:inline-flex" : "inline-flex"
                }`}
              >
                <s.icon className="size-4" />
                <span className="hidden sm:inline">{s.label}</span>
              </span>
            ))}
          </div>

          {/* Visible tabs */}
          <div className="flex flex-wrap justify-center gap-2">
            {styles.slice(0, 4).map((s) => (
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
            {/* Flex line break — only inserted when buttons overflow a single row */}
            {splitTabs && <div className="basis-full h-0" aria-hidden />}
            {styles.slice(4).map((s) => (
              <button
                key={s.key}
                onClick={() => setActive(s.key)}
                className={`items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 sm:px-4 ${
                  s.key === "masonry" ? "hidden sm:inline-flex" : "inline-flex"
                } ${
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
        </div>

        {/* Preview area */}
        <div
          ref={containerRef}
          className="rounded-2xl border border-border bg-card/30 p-4 sm:p-6 md:p-8"
        >
          <div ref={contentRef}>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {active === "cards" ? (
                  <CardsGrid testimonials={sampleTestimonials} fillRows />
                ) : (
                  <Component
                    testimonials={sampleTestimonials}
                    autoplay
                    speed="fast"
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          All styles · All free · No upsell on design
        </p>
      </div>
    </section>
  );
}
