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
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center sm:mb-16"
        >
          <h2
            className="mb-4 font-bold tracking-tight"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)" }}
          >
            Your best customers{" "}
            <span className="text-gradient">love you.</span>
          </h2>
          <p className="mx-auto max-w-xl text-base text-muted-foreground sm:text-lg">
            But your website visitors don&apos;t know that yet.
          </p>
        </motion.div>

        <div
          className="grid gap-5"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
          }}
        >
          {painPoints.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-xl border border-border bg-card/50 p-5 hover-lift sm:p-6"
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-destructive/10">
                <p.icon className="size-5 text-destructive" />
              </div>
              <h3 className="mb-2 font-semibold text-foreground">{p.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {p.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
