"use client";

import { type Testimonial } from "@/data/sample-testimonials";
import { Star } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { type ShowcaseConfig, getCardClasses, getFontClass, shouldShow, formatDate } from "@/lib/showcase-helpers";

interface Props {
  testimonials: Testimonial[];
  config?: ShowcaseConfig;
}

const COL_MIN = 280;
const GAP = 20; // gap-5 = 1.25rem = 20px

export function CardsGrid({ testimonials, config, fillRows }: Props & { fillRows?: boolean }) {
  const card = getCardClasses(config);
  const shouldFill = fillRows ?? config?.fillRows ?? false;
  const gridRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(testimonials.length);

  const recalc = useCallback(() => {
    if (!shouldFill) { setVisibleCount(testimonials.length); return; }
    const el = gridRef.current;
    if (!el) return;
    const width = el.clientWidth;
    const cols = Math.max(1, Math.floor((width + GAP) / (COL_MIN + GAP)));
    const fullRows = Math.floor(testimonials.length / cols);
    setVisibleCount(fullRows > 0 ? fullRows * cols : testimonials.length);
  }, [testimonials.length, shouldFill]);

  useEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    recalc();
    const ro = new ResizeObserver(recalc);
    ro.observe(el);
    return () => ro.disconnect();
  }, [recalc]);

  const visible = testimonials.slice(0, visibleCount);

  return (
    <div ref={gridRef} className={`grid gap-5 ${getFontClass(config)}`} style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))" }}>
      {visible.map((t, i) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          className={`group flex flex-col ${card} p-5 sm:p-6 hover-lift cursor-default`}
        >
          {shouldShow("showRating", config) && (
            <div className="mb-3 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, si) => (
                <Star
                  key={si}
                  className={`size-4 ${si < t.rating ? "fill-accent text-accent" : "text-muted"}`}
                />
              ))}
            </div>
          )}
          <p className="mb-4 flex-1 text-sm leading-relaxed text-foreground/90 line-clamp-6">
            &ldquo;{t.text}&rdquo;
          </p>
          {shouldShow("showDate", config) && t.createdAt && (
            <p className="mb-2 text-[10px] text-muted-foreground">{formatDate(t.createdAt)}</p>
          )}
          <div className="mt-auto flex items-center gap-3">
            {shouldShow("showPhoto", config) && t.authorPhoto && (
              <img
                src={t.authorPhoto}
                alt={t.authorName}
                className="size-9 rounded-full bg-muted"
              />
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {t.authorName}
              </p>
              {shouldShow("showCompany", config) && (
                <p className="truncate text-xs text-muted-foreground">
                  {t.authorTitle}, {t.authorCompany}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
      {shouldShow("showBranding", config) && (
        <div className="col-span-full pt-2 text-center text-[10px] text-muted-foreground/50">
          Powered by ProofWall
        </div>
      )}
    </div>
  );
}
