"use client";

import { useRef, useEffect, useCallback } from "react";
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

function MarqueeCard({ t, config }: { t: Testimonial; config?: ShowcaseConfig }) {
  const card = getCardClasses(config);

  return (
    <div className={`mb-3 ${card} p-4 sm:p-5`}>
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
      <p className="mb-3 text-sm leading-relaxed text-foreground/90">
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
  );
}

export function VerticalMarquee({ testimonials, speed = "normal", autoplay = true, pauseOnHover = true, config }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);

  const targetPxPerSec = speed === "slow" ? 30 : speed === "fast" ? 90 : 50;

  const rafLoop = useCallback(() => {
    const track = trackRef.current;
    if (!track || !autoplay) return;

    let velocity = 0;
    const EASE_RATE = 2.5;
    let lastTime = 0;
    let rafId = 0;
    let hovered = false;

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

      const desired = hovered && pauseOnHover ? 0 : targetPxPerSec;
      const diff = desired - velocity;
      velocity += diff * Math.min(1, EASE_RATE * delta);

      if (Math.abs(velocity) < 0.5 && desired === 0) {
        velocity = 0;
      }

      if (velocity > 0) {
        offsetRef.current -= velocity * delta;

        // Reset when first copy has fully scrolled out
        const halfHeight = track.scrollHeight / 2;
        if (Math.abs(offsetRef.current) >= halfHeight) {
          offsetRef.current += halfHeight;
        }

        track.style.transform = `translateY(${offsetRef.current}px)`;
      }

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
  }, [autoplay, targetPxPerSec, pauseOnHover]);

  useEffect(() => {
    return rafLoop();
  }, [rafLoop]);

  const doubled = [...testimonials, ...testimonials];

  return (
    <div className={getFontClass(config)}>
      <div className="relative mx-auto h-[400px] max-w-md overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-[var(--background)] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-[var(--background)] to-transparent" />
        <div ref={trackRef}>
          {doubled.map((t, i) => (
            <MarqueeCard key={`m-${i}`} t={t} config={config} />
          ))}
        </div>
      </div>
      {shouldShow("showBranding", config) && (
        <div className="pt-3 text-center text-[10px] text-muted-foreground/50">
          Powered by ProofWall
        </div>
      )}
    </div>
  );
}
