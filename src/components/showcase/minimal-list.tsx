"use client";

import { type Testimonial } from "@/data/sample-testimonials";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { type ShowcaseConfig, getFontClass, shouldShow, formatDate } from "@/lib/showcase-helpers";

interface Props {
  testimonials: Testimonial[];
  config?: ShowcaseConfig;
}

function ListItem({ t, index, config }: { t: Testimonial; index: number; config?: ShowcaseConfig }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const attribution = shouldShow("showCompany", config)
    ? `— ${t.authorName}, ${t.authorTitle} at ${t.authorCompany}`
    : `— ${t.authorName}`;

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={visible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="py-5"
      >
        <p className="mb-2 text-base italic leading-relaxed text-foreground/90">
          &ldquo;{t.text}&rdquo;
        </p>
        <p className="text-sm text-muted-foreground">{attribution}</p>
        {shouldShow("showDate", config) && t.createdAt && (
          <p className="mt-1 text-[10px] text-muted-foreground/70">{formatDate(t.createdAt)}</p>
        )}
      </motion.div>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={visible ? { scaleX: 1 } : {}}
        transition={{ duration: 0.3, delay: index * 0.05 + 0.2 }}
        className="h-px origin-left bg-border"
      />
    </div>
  );
}

export function MinimalList({ testimonials, config }: Props) {
  return (
    <div className={`mx-auto max-w-2xl ${getFontClass(config)}`}>
      {testimonials.map((t, i) => (
        <ListItem key={t.id} t={t} index={i} config={config} />
      ))}
      {shouldShow("showBranding", config) && (
        <div className="pt-4 text-center text-[10px] text-muted-foreground/50">
          Powered by Laudica
        </div>
      )}
    </div>
  );
}
