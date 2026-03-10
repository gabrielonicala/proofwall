"use client";

import { useState } from "react";
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

function MarqueeCard({
  t,
  config,
  onMouseEnter,
  onMouseLeave,
}: {
  t: Testimonial;
  config?: ShowcaseConfig;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const card = getCardClasses(config);

  return (
    <div
      className={`mb-3 ${card} p-4 sm:p-5`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
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
  const [hovered, setHovered] = useState(false);
  const duration = speed === "slow" ? "40s" : speed === "fast" ? "15s" : "25s";
  const doubled = [...testimonials, ...testimonials];
  const isPaused = !autoplay || (pauseOnHover && hovered);

  return (
    <div className={getFontClass(config)}>
      <div className="relative mx-auto h-[400px] max-w-md overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-[var(--background)] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-[var(--background)] to-transparent" />
        <div
          className="animate-marquee"
          style={{ "--marquee-speed": duration, ...(isPaused ? { animationPlayState: "paused" } : {}) } as React.CSSProperties}
        >
          {doubled.map((t, i) => (
            <MarqueeCard
              key={`m-${i}`}
              t={t}
              config={config}
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
            />
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
