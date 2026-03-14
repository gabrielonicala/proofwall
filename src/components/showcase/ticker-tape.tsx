"use client";

import { useRef, useEffect } from "react";
import { type Testimonial } from "@/data/sample-testimonials";
import { Star } from "lucide-react";
import { type ShowcaseConfig, getCardClasses, getFontClass, shouldShow, formatDate } from "@/lib/showcase-helpers";

interface Props {
  testimonials: Testimonial[];
  speed?: "slow" | "normal" | "fast";
  autoplay?: boolean;
  pauseOnHover?: boolean;
  config?: ShowcaseConfig;
}

function TickerCard({ t, config }: { t: Testimonial; config?: ShowcaseConfig }) {
  const card = getCardClasses(config);

  return (
    <div className={`mx-2 inline-flex w-[300px] flex-shrink-0 ${card} p-4 sm:w-[340px] sm:p-5`}>
      <div className="min-w-0">
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
        <p className="mb-3 text-sm leading-relaxed text-foreground/90 line-clamp-3">
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
      </div>
    </div>
  );
}

export function TickerTape({ testimonials, speed = "normal", autoplay = true, pauseOnHover = true, config }: Props) {
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  const speed1 = speed === "slow" ? 30 : speed === "fast" ? 60 : 45;
  const speed2 = speed === "slow" ? 25 : speed === "fast" ? 50 : 38;

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

  return (
    <div className={`space-y-3 overflow-hidden ${getFontClass(config)}`}>
      <div className="overflow-hidden">
        <div ref={row1Ref} className="flex w-max">
          {doubled.map((t, i) => (
            <TickerCard key={`r1-${i}`} t={t} config={config} />
          ))}
        </div>
      </div>
      <div className="overflow-hidden">
        <div ref={row2Ref} className="flex w-max">
          {doubled.map((t, i) => (
            <TickerCard key={`r2-${i}`} t={t} config={config} />
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
