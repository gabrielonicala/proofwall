"use client";

import { type Testimonial } from "@/data/sample-testimonials";
import { Star, Quote } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type ShowcaseConfig, getFontClass, shouldShow, formatDate } from "@/lib/showcase-helpers";

interface Props {
  testimonials: Testimonial[];
  speed?: "slow" | "normal" | "fast";
  autoplay?: boolean;
  pauseOnHover?: boolean;
  config?: ShowcaseConfig;
}

function RotatorContent({ t, config }: { t: Testimonial; config?: ShowcaseConfig }) {
  return (
    <>
      <p className="mb-6 text-lg font-light leading-relaxed text-foreground/90 sm:text-xl md:text-2xl">
        &ldquo;{t.text}&rdquo;
      </p>
      {shouldShow("showRating", config) && (
        <div className="mb-3 flex justify-center gap-0.5">
          {Array.from({ length: 5 }).map((_, si) => (
            <Star
              key={si}
              className={`size-4 ${si < t.rating ? "fill-accent text-accent" : "text-muted"}`}
            />
          ))}
        </div>
      )}
      {shouldShow("showDate", config) && t.createdAt && (
        <p className="mb-3 text-xs text-muted-foreground">{formatDate(t.createdAt)}</p>
      )}
      <div className="flex items-center justify-center gap-3">
        {shouldShow("showPhoto", config) && t.authorPhoto && (
          <img src={t.authorPhoto} alt={t.authorName} className="size-10 rounded-full bg-muted" />
        )}
        <div className="text-left">
          <p className="font-medium text-foreground">{t.authorName}</p>
          {shouldShow("showCompany", config) && (
            <p className="text-sm text-muted-foreground">
              {t.authorTitle}, {t.authorCompany}
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export function FadeRotator({ testimonials, speed = "normal", autoplay = true, pauseOnHover = true, config }: Props) {
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);
  const measureRef = useRef<HTMLDivElement>(null);
  const interval = speed === "slow" ? 6000 : speed === "fast" ? 2500 : 4000;

  // Measure tallest testimonial content
  useEffect(() => {
    const el = measureRef.current;
    if (!el) return;
    let max = 0;
    for (let i = 0; i < el.children.length; i++) {
      max = Math.max(max, (el.children[i] as HTMLElement).offsetHeight);
    }
    if (max > 0) setContentHeight(max);
  }, [testimonials, config]);

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    if (!autoplay) return;
    if (pauseOnHover && hovered) return;
    const id = setInterval(next, interval);
    return () => clearInterval(id);
  }, [autoplay, interval, next, pauseOnHover, hovered, current]);

  const t = testimonials[current];

  return (
    <div className={`relative mx-auto flex max-w-2xl flex-col items-center justify-center py-8 text-center ${getFontClass(config)}`}>
      {/* Hidden measurement container */}
      <div ref={measureRef} aria-hidden className="pointer-events-none absolute left-0 right-0 -z-10 opacity-0">
        {testimonials.map((item) => (
          <div key={item.id} className="text-center">
            <RotatorContent t={item} config={config} />
          </div>
        ))}
      </div>

      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          key={current}
          className="mb-6"
        >
          <Quote className="mx-auto size-10 text-primary/30" />
        </motion.div>

        <div style={contentHeight ? { minHeight: contentHeight } : undefined}>
          <AnimatePresence mode="wait">
            <motion.div
              key={t.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            >
              <RotatorContent t={t} config={config} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      {shouldShow("showBranding", config) && (
        <div className="pt-4 text-center text-[10px] text-muted-foreground/50">
          Powered by ProofWall
        </div>
      )}
    </div>
  );
}
