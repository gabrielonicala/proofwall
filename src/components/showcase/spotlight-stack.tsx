"use client";

import { type Testimonial } from "@/data/sample-testimonials";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type ShowcaseConfig, getCardClasses, getFontClass, shouldShow, formatDate } from "@/lib/showcase-helpers";

interface Props {
  testimonials: Testimonial[];
  autoplay?: boolean;
  speed?: "slow" | "normal" | "fast";
  pauseOnHover?: boolean;
  config?: ShowcaseConfig;
}

function SpotlightCardContent({ t, config }: { t: Testimonial; config?: ShowcaseConfig }) {
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
      <p className="mb-6 flex-1 text-base leading-relaxed text-foreground/90 sm:text-lg md:text-xl">
        &ldquo;{t.text}&rdquo;
      </p>
      {shouldShow("showDate", config) && t.createdAt && (
        <p className="mb-2 text-xs text-muted-foreground">{formatDate(t.createdAt)}</p>
      )}
      <div className="mt-auto flex items-center gap-3">
        {shouldShow("showPhoto", config) && t.authorPhoto && (
          <img
            src={t.authorPhoto}
            alt={t.authorName}
            className="size-12 rounded-full bg-muted"
          />
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">
            {t.authorName}
          </p>
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

export function SpotlightStack({ testimonials, autoplay = false, speed = "normal", pauseOnHover = true, config }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [cardHeight, setCardHeight] = useState<number | undefined>(undefined);
  const active = testimonials[activeIndex];
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const measureRef = useRef<HTMLDivElement>(null);
  const isResettingRef = useRef(false);

  const len = testimonials.length;
  const card = getCardClasses(config);

  // Triple the list so we can always scroll forward/backward seamlessly
  const tripled = useMemo(
    () => [...testimonials, ...testimonials, ...testimonials],
    [testimonials]
  );

  // Current scroll target in the middle third
  const centerIndex = len + activeIndex;

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

  const scrollToIndex = useCallback(
    (index: number, smooth: boolean) => {
      const el = cardRefs.current[index];
      const container = scrollRef.current;
      if (!el || !container) return;

      const containerRect = container.getBoundingClientRect();
      const cardRect = el.getBoundingClientRect();
      const offset =
        cardRect.left -
        containerRect.left -
        containerRect.width / 2 +
        cardRect.width / 2 +
        container.scrollLeft;

      container.scrollTo({
        left: offset,
        behavior: smooth ? "smooth" : "instant",
      });
    },
    []
  );

  // After a smooth scroll, silently reset to the center third equivalent
  const resetToCenter = useCallback(() => {
    isResettingRef.current = true;
    scrollToIndex(centerIndex, false);
    requestAnimationFrame(() => {
      isResettingRef.current = false;
    });
  }, [centerIndex, scrollToIndex]);

  const go = useCallback(
    (dir: -1 | 1) => {
      setDirection(dir);
      const next = (activeIndex + dir + len) % len;

      const visualTarget = centerIndex + dir;
      scrollToIndex(visualTarget, true);

      setTimeout(() => {
        setActiveIndex(next);
      }, 350);
    },
    [activeIndex, centerIndex, len, scrollToIndex]
  );

  // On mount, jump to center instantly
  useEffect(() => {
    scrollToIndex(centerIndex, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When activeIndex changes (after the scroll animation), reset to center third
  useEffect(() => {
    if (isResettingRef.current) return;
    resetToCenter();
  }, [activeIndex, resetToCenter]);

  // Autoplay
  const [hovered, setHovered] = useState(false);
  const autoplayInterval = speed === "slow" ? 7000 : speed === "fast" ? 3000 : 5000;

  useEffect(() => {
    if (!autoplay) return;
    if (pauseOnHover && hovered) return;
    const id = setInterval(() => go(1), autoplayInterval);
    return () => clearInterval(id);
  }, [autoplay, autoplayInterval, pauseOnHover, hovered, go]);

  return (
    <div
      className={`mx-auto max-w-3xl ${getFontClass(config)}`}
      style={{ perspective: "1200px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Hidden measurement container */}
      <div ref={measureRef} aria-hidden className="pointer-events-none absolute left-0 right-0 -z-10 opacity-0">
        {testimonials.map((item) => (
          <div key={item.id} className={`flex flex-col ${card} p-6 glow sm:p-8`}>
            <SpotlightCardContent t={item} config={config} />
          </div>
        ))}
      </div>

      {/* Active card */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={active.id}
          custom={direction}
          initial={{ opacity: 0, rotateY: direction * -10, scale: 0.95 }}
          animate={{ opacity: 1, rotateY: 0, scale: 1 }}
          exit={{ opacity: 0, rotateY: direction * 10, scale: 0.95 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={`mb-8 flex flex-col ${card} p-6 glow sm:p-8`}
          style={cardHeight ? { height: cardHeight } : { minHeight: 280 }}
        >
          <SpotlightCardContent t={active} config={config} />
        </motion.div>
      </AnimatePresence>

      {/* Preview row */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => go(-1)}
          className="flex size-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary transition-colors hover:bg-primary/25"
          aria-label="Previous testimonial"
        >
          <ChevronLeft className="size-4" />
        </button>

        <div className="relative min-w-0 flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[var(--background)] to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[var(--background)] to-transparent" />

          <div
            ref={scrollRef}
            className="scrollbar-none flex gap-3 overflow-x-hidden py-3"
          >
            {tripled.map((t, i) => {
              const isActive = i === centerIndex;

              return (
                <button
                  key={`preview-${i}`}
                  ref={(el) => {
                    cardRefs.current[i] = el;
                  }}
                  onClick={() => {
                    const realIndex = i % len;
                    if (realIndex !== activeIndex) {
                      setDirection(realIndex > activeIndex ? 1 : -1);
                      setActiveIndex(realIndex);
                    }
                  }}
                  className={`w-40 flex-shrink-0 rounded-xl border p-3 text-left transition-all duration-300 sm:w-44 ${
                    isActive
                      ? "scale-105 border-primary/50 bg-card shadow-lg shadow-primary/10"
                      : "border-transparent opacity-50 hover:opacity-70"
                  }`}
                >
                  <p className="mb-2 text-xs leading-relaxed text-foreground/80 line-clamp-2">
                    &ldquo;{t.text}&rdquo;
                  </p>
                  <p className="truncate text-[10px] font-medium text-muted-foreground">
                    {t.authorName}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={() => go(1)}
          className="flex size-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary transition-colors hover:bg-primary/25"
          aria-label="Next testimonial"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
      {shouldShow("showBranding", config) && (
        <div className="pt-3 text-center text-[10px] text-muted-foreground/50">
          Powered by ProofWall
        </div>
      )}
    </div>
  );
}
