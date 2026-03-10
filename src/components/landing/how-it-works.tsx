"use client";

import { motion } from "framer-motion";
import { Link2, Tags, LayoutGrid, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Link2,
    step: "01",
    title: "Collect",
    desc: "Send a beautiful branded form, or just paste a tweet URL. Your best proof already exists — grab it.",
  },
  {
    icon: Tags,
    step: "02",
    title: "Tag & Organize",
    desc: "Tag by context: pricing, trust, results, features, onboarding. Smart organization for smart deployment.",
  },
  {
    icon: LayoutGrid,
    step: "03",
    title: "Deploy Smart Walls",
    desc: "Choose a showcase style, filter by tags, embed anywhere. The right proof on the right page.",
  },
];

export function HowItWorks() {
  return (
    <section id="features" className="py-16 md:py-20">
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
            How <span className="text-gradient">ProofWall</span> works
          </h2>
          <p className="text-base text-muted-foreground sm:text-lg">
            Three steps to social proof that actually converts.
          </p>
        </motion.div>

        <div className="relative grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Connecting line (desktop only) */}
          <div className="pointer-events-none absolute left-[20%] right-[20%] top-16 hidden h-px bg-gradient-to-r from-primary/30 via-primary/60 to-primary/30 md:block" />

          {steps.map((s, i) => (
            <motion.div
              key={s.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative text-center"
            >
              <div className="relative mb-6 inline-flex">
                <div className="relative z-10 flex size-14 items-center justify-center rounded-2xl bg-gradient-primary">
                  <s.icon className="size-6 text-primary-foreground" />
                </div>
                <span className="absolute -right-2 -top-2 z-20 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-xs font-bold text-primary">
                  {s.step}
                </span>
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">
                {s.title}
              </h3>
              <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
              {i < steps.length - 1 && (
                <ArrowRight className="absolute -right-4 top-16 hidden size-5 text-primary/40 md:block" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
