"use client";

import { type Testimonial } from "@/data/sample-testimonials";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type ShowcaseConfig, getCardClasses, getFontClass, shouldShow, formatDate } from "@/lib/showcase-helpers";

interface Props {
  testimonials: Testimonial[];
  autoplay?: boolean;
  speed?: "slow" | "normal" | "fast";
  pauseOnHover?: boolean;
  config?: ShowcaseConfig;
}

function CardContent({ t, config }: { t: Testimonial; config?: ShowcaseConfig }) {
  return (
    <>
      {shouldShow("showRating", config) && (
        <div className="mb-4 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, si) => (
            <Star
              key={si}
              className={`size-5 ${si < t.rating ? "fill-accent text-accent" : "text-muted"}`}
            />
          ))}
        </div>
      )}
      <p className="mb-6 flex-1 text-base leading-relaxed text-foreground/90 sm:text-lg">
        &ldquo;{t.text}&rdquo;
      </p>
      {shouldShow("showDate", config) && t.createdAt && (
        <p className="mb-3 text-xs text-muted-foreground">{formatDate(t.createdAt)}</p>
      )}
      <div className="mt-auto flex items-center gap-3">
        {shouldShow("showPhoto", config) && t.authorPhoto && (
          <img
            src={t.authorPhoto}
            alt={t.authorName}
            className="size-10 rounded-full bg-muted"
          />
        )}
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{t.authorName}</p>
          {shouldShow("showCompany", config) && (
            <p className="truncate text-sm text-muted-foreground">
              {t.authorTitle}, {t.authorCompany}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export function Carousel({ testimonials, autoplay = true, speed = "normal", pauseOnHover = true, config }: Props) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hovered, setHovered] = useState(false);
  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined);
  const measureRef = useRef<HTMLDivElement>(null);
  const interval = speed === "slow" ? 7000 : speed === "fast" ? 3000 : 5000;

  // Measure tallest card
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    let max = 0;
    for (let i = 0; i < el.children.length; i++) {
      max = Math.max(max, (el.children[i] as HTMLElement).offsetHeight);
    }
    if (max > 0) setCardHeight(max);
  }, [testimonials, config]);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((p) => (p + 1) % testimonials.length);
  }, [testimonials.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((p) => (p - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    if (!autoplay) return;
    if (pauseOnHover && hovered) return;
    const id = setInterval(next, interval);
    return () => clearInterval(id);
  }, [autoplay, interval, next, pauseOnHover, hovered, current]);

  const t = testimonials[current];
  const card = getCardClasses(config);

  return (
    <div className={`relative mx-auto w-full max-w-2xl ${getFontClass(config)}`}>
      {/* Hidden measurement container */}
      <div ref={measureRef} aria-hidden className="pointer-events-none absolute left-0 right-0 -z-10 opacity-0">
        {testimonials.map((item) => (
          <div key={item.id} className={`flex flex-col ${card} p-6 sm:p-8`}>
            <CardContent t={item} config={config} />
          </div>
        ))}
      </div>

      <div
        className={`flex flex-col overflow-hidden ${card} p-6 sm:p-8`}
        style={cardHeight ? { height: cardHeight } : { minHeight: 280 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={t.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
            className="flex flex-1 flex-col"
          >
            <CardContent t={t} config={config} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Nav arrows */}
      <button
        onClick={prev}
        className="absolute left-0 top-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card transition-transform hover:scale-110"
        aria-label="Previous testimonial"
      >
        <ChevronLeft className="size-4 text-foreground" />
      </button>
      <button
        onClick={next}
        className="absolute right-0 top-1/2 flex size-9 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border border-border bg-card transition-transform hover:scale-110"
        aria-label="Next testimonial"
      >
        <ChevronRight className="size-4 text-foreground" />
      </button>

      {/* Dot indicators */}
      <div className="mt-4 flex justify-center gap-2">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setDirection(i > current ? 1 : -1);
              setCurrent(i);
            }}
            className={`h-2 rounded-full transition-all duration-200 ${
              i === current ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30"
            }`}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
      {shouldShow("showBranding", config) && (
        <div className="pt-3 text-center text-[10px] text-muted-foreground/50">
          Powered by ProofWall
        </div>
      )}
    </div>
  );
}
