"use client";

import { useRef, useEffect, useState } from "react";
import { type Testimonial } from "@/data/sample-testimonials";
import { Star } from "lucide-react";
import { type ShowcaseConfig, getCardClasses, getCardBorderStyle, getFontClass, shouldShow, formatDate } from "@/lib/showcase-helpers";

interface Props {
  testimonials: Testimonial[];
  speed?: "slow" | "normal" | "fast";
  autoplay?: boolean;
  pauseOnHover?: boolean;
  config?: ShowcaseConfig;
}

function TickerCardContent({ t, config }: { t: Testimonial; config?: ShowcaseConfig }) {
  return (
    <>
      {shouldShow("showRating", config) && (
        <div className="mb-2 flex gap-0.5">
          {Array.from({ length: 5 }).map((_, si) => (
            <Star
              key={si}
              className={`size-3.5 ${si < t.rating ? "fill-accent text-accent" : "text-muted"}`}
            />
          ))}
        </div>
      )}
      <p className="mb-3 flex-1 text-sm leading-relaxed text-foreground/90">
        &ldquo;{t.text}&rdquo;
      </p>
      {shouldShow("showDate", config) && t.createdAt && (
        <p className="mb-1 text-[10px] text-muted-foreground">{formatDate(t.createdAt)}</p>
      )}
      <div className="flex items-center gap-2">
        {shouldShow("showPhoto", config) && t.authorPhoto && (
          <img src={t.authorPhoto} alt={t.authorName} className="size-7 rounded-full bg-muted" />
        )}
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-foreground">{t.authorName}</p>
          {shouldShow("showCompany", config) && (
            <p className="truncate text-[10px] text-muted-foreground">{t.authorCompany}</p>
          )}
        </div>
      </div>
    </>
  );
}

export function TickerTape({ testimonials, speed = "normal", autoplay = true, pauseOnHover = true, config }: Props) {
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState<number>(0);

  const card = getCardClasses(config);
  const speed1 = speed === "slow" ? 30 : speed === "fast" ? 60 : 45;
  const speed2 = speed === "slow" ? 25 : speed === "fast" ? 50 : 38;

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

  // Row 1: scrolls LEFT
  useEffect(() => {
    const track = row1Ref.current!;
    if (!track || !autoplay) return;

    let offset = 0;
    let velocity = 0;
    let lastTime = 0;
    let rafId = 0;
    let hovered = false;
    const EASE_RATE = 2.5;

    const onEnter = () => { hovered = true; };
    const onLeave = () => { hovered = false; };
    if (pauseOnHover) {
      track.parentElement?.addEventListener("mouseenter", onEnter);
      track.parentElement?.addEventListener("mouseleave", onLeave);
    }

    function tick(time: number) {
      if (lastTime === 0) lastTime = time;
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const desired = hovered && pauseOnHover ? 0 : speed1;
      velocity += (desired - velocity) * Math.min(1, EASE_RATE * delta);
      if (Math.abs(velocity) < 0.5 && desired === 0) velocity = 0;

      offset += velocity * delta;
      const half = track.scrollWidth / 2;
      if (half > 0 && offset >= half) offset -= half;

      track.style.transform = `translateX(${-offset}px)`;
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      if (pauseOnHover && track.parentElement) {
        track.parentElement.removeEventListener("mouseenter", onEnter);
        track.parentElement.removeEventListener("mouseleave", onLeave);
      }
    };
  }, [autoplay, speed1, pauseOnHover]);

  // Row 2: scrolls RIGHT
  useEffect(() => {
    const track = row2Ref.current!;
    if (!track || !autoplay) return;

    let offset = 0;
    let velocity = 0;
    let lastTime = 0;
    let rafId = 0;
    let hovered = false;
    const EASE_RATE = 2.5;

    const onEnter = () => { hovered = true; };
    const onLeave = () => { hovered = false; };
    if (pauseOnHover) {
      track.parentElement?.addEventListener("mouseenter", onEnter);
      track.parentElement?.addEventListener("mouseleave", onLeave);
    }

    function tick(time: number) {
      if (lastTime === 0) lastTime = time;
      const delta = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const desired = hovered && pauseOnHover ? 0 : speed2;
      velocity += (desired - velocity) * Math.min(1, EASE_RATE * delta);
      if (Math.abs(velocity) < 0.5 && desired === 0) velocity = 0;

      offset += velocity * delta;
      const half = track.scrollWidth / 2;
      if (half > 0 && offset >= half) offset -= half;

      // Start shifted left by one copy, scroll rightward
      track.style.transform = `translateX(${-half + offset}px)`;
      rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      if (pauseOnHover && track.parentElement) {
        track.parentElement.removeEventListener("mouseenter", onEnter);
        track.parentElement.removeEventListener("mouseleave", onLeave);
      }
    };
  }, [autoplay, speed2, pauseOnHover]);

  const doubled = [...testimonials, ...testimonials];
  const heightStyle = cardHeight > 0 ? { height: cardHeight } : undefined;

  return (
    <div className={`space-y-3 overflow-hidden ${getFontClass(config)}`}>
      {/* Hidden measurement container — renders each card at natural height */}
      <div ref={measureRef} aria-hidden className="pointer-events-none absolute left-0 right-0 -z-10 opacity-0">
        {testimonials.map((t) => (
          <div key={t.id} className={`inline-flex w-[300px] flex-col ${card} p-4 sm:w-[340px] sm:p-5`} style={getCardBorderStyle(config)}>
            <TickerCardContent t={t} config={config} />
          </div>
        ))}
      </div>

      <div className="overflow-hidden">
        <div ref={row1Ref} className="flex w-max">
          {doubled.map((t, i) => (
            <div key={`r1-${i}`} className={`mx-2 inline-flex w-[300px] flex-shrink-0 flex-col ${card} p-4 sm:w-[340px] sm:p-5`} style={{ ...heightStyle, ...getCardBorderStyle(config) }}>
              <TickerCardContent t={t} config={config} />
            </div>
          ))}
        </div>
      </div>
      <div className="overflow-hidden">
        <div ref={row2Ref} className="flex w-max">
          {doubled.map((t, i) => (
            <div key={`r2-${i}`} className={`mx-2 inline-flex w-[300px] flex-shrink-0 flex-col ${card} p-4 sm:w-[340px] sm:p-5`} style={{ ...heightStyle, ...getCardBorderStyle(config) }}>
              <TickerCardContent t={t} config={config} />
            </div>
          ))}
        </div>
      </div>
      {shouldShow("showBranding", config) && (
        <div className="pt-2 text-center text-[10px] text-muted-foreground/50">
          Powered by Laudica
        </div>
      )}
    </div>
  );
}
