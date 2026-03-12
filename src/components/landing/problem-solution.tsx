"use client";

import { motion } from "framer-motion";
import { MessageSquareOff, Copy, EyeOff } from "lucide-react";

const painPoints = [
  {
    icon: MessageSquareOff,
    title: "Buried in screenshots & DMs",
    desc: "Your best testimonials live in Twitter mentions, DMs, and emails — scattered and unusable.",
  },
  {
    icon: Copy,
    title: "Same wall on every page",
    desc: "A generic testimonials page doesn't match what your visitor is evaluating right now.",
  },
  {
    icon: EyeOff,
    title: "No idea if it's even seen",
    desc: "You've embedded social proof but have zero data on whether anyone actually reads it.",
  },
];

export function ProblemSolution() {
  return (
    <section className="py-16 md:py-20">
      {/* Section divider */}
      <div className="section-divider mx-auto mb-16 w-full max-w-xl md:mb-20" />

      <div className="container-wide">
        {/* Two-column asymmetric layout */}
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1fr_1.5fr] lg:gap-16">
          {/* Left: heading (sticky on desktop) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:sticky lg:top-24"
          >
            <h2
              className="font-display mb-4 tracking-tight"
              style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}
            >
              Your best customers{" "}
              <span className="text-gradient">love you.</span>
            </h2>
            <p className="max-w-md text-base text-muted-foreground sm:text-lg">
              But your website visitors don&apos;t know that yet.
              Here&apos;s what&apos;s standing in the way.
            </p>
          </motion.div>

          {/* Right: pain point cards (stacked) */}
          <div className="space-y-4">
            {painPoints.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="flex gap-4 rounded-xl border border-border bg-card/50 p-5 hover-lift sm:p-6"
              >
                <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                  <p.icon className="size-5 text-destructive" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-foreground">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {p.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
