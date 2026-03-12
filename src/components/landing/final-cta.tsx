"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-16 md:py-20">
      <div className="absolute inset-0 bg-gradient-primary opacity-[0.07]" />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 size-96 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 size-80 rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      {/* Grain overlay */}
      <div className="grain absolute inset-0 pointer-events-none" />

      {/* Section divider at top */}
      <div className="section-divider absolute inset-x-0 top-0" />

      <div className="container-wide relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            className="font-display mb-6 tracking-tight"
            style={{ fontSize: "clamp(1.75rem, 5vw, 3.25rem)" }}
          >
            Your next customer is one
            <br />
            <span className="text-gradient">testimonial away.</span>
          </h2>

          <Link
            href="/signup"
            className="group inline-flex h-12 items-center gap-1 rounded-lg bg-gradient-primary px-10 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90 sm:h-13"
          >
            Start Free
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <p className="mt-4 text-sm text-muted-foreground">
            2 min setup · No credit card · Free forever plan
          </p>
        </motion.div>
      </div>
    </section>
  );
}
