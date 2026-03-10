"use client";

import { type Testimonial } from "@/data/sample-testimonials";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { type ShowcaseConfig, getCardClasses, getFontClass, shouldShow, formatDate } from "@/lib/showcase-helpers";

interface Props {
  testimonials: Testimonial[];
  config?: ShowcaseConfig;
}

export function MasonryGrid({ testimonials, config }: Props) {
  const card = getCardClasses(config);

  return (
    <div className={`@container columns-1 gap-4 @sm:columns-2 @lg:columns-3 ${getFontClass(config)}`}>
      {testimonials.map((t, i) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.5,
            delay: i * 0.08,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={`mb-4 break-inside-avoid ${card} p-5 hover-lift`}
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
              <img
                src={t.authorPhoto}
                alt={t.authorName}
                className="size-8 rounded-full bg-muted"
              />
            )}
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">
                {t.authorName}
              </p>
              {shouldShow("showCompany", config) && (
                <p className="truncate text-[10px] text-muted-foreground">
                  {t.authorTitle}, {t.authorCompany}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      ))}
      {shouldShow("showBranding", config) && (
        <div className="break-inside-avoid pt-2 text-center text-[10px] text-muted-foreground/50">
          Powered by ProofWall
        </div>
      )}
    </div>
  );
}
