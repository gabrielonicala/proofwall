"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const pages = [
  {
    name: "Homepage",
    url: "yoursite.com",
    tags: ["trust", "quality"],
    testimonials: [
      {
        text: "Laudica completely transformed our conversion rate.",
        author: "Sarah Chen",
        rating: 5,
      },
      {
        text: "The showcase styles are absolutely gorgeous.",
        author: "Marcus Johnson",
        rating: 5,
      },
    ],
  },
  {
    name: "Pricing Page",
    url: "yoursite.com/pricing",
    tags: ["results", "pricing"],
    testimonials: [
      {
        text: "Our pricing page alone saw a 34% lift.",
        author: "Sarah Chen",
        rating: 5,
      },
      {
        text: "The ROI is absurd for the price.",
        author: "Aisha Patel",
        rating: 5,
      },
    ],
  },
  {
    name: "Features Page",
    url: "yoursite.com/features",
    tags: ["features", "speed"],
    testimonials: [
      {
        text: "I pasted 50 tweet URLs and had a wall in under 10 minutes.",
        author: "Emily Rodriguez",
        rating: 5,
      },
      {
        text: "The embed widget is incredibly lightweight.",
        author: "Lisa Wang",
        rating: 5,
      },
    ],
  },
];

export function SmartWalls() {
  return (
    <section className="py-16 md:py-20">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center sm:mb-16"
        >
          <h2
            className="font-display mb-4 tracking-tight"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}
          >
            The right proof, on the{" "}
            <span className="text-gradient">right page</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
            Tag testimonials by context. Deploy filtered walls per page.
            <br />
            Every page gets the perfect social proof.
          </p>
        </motion.div>

        <div
          className="grid gap-5"
          style={{
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
          }}
        >
          {pages.map((page, pi) => (
            <motion.div
              key={page.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: pi * 0.12 }}
              className="overflow-hidden rounded-xl border border-border bg-card/50 hover-lift"
            >
              {/* Browser bar */}
              <div className="flex items-center gap-2 border-b border-border/50 bg-muted/30 px-4 py-2.5">
                <div className="flex gap-1.5">
                  <div className="size-2 rounded-full bg-destructive/40" />
                  <div className="size-2 rounded-full bg-accent/40" />
                  <div className="size-2 rounded-full bg-success/40" />
                </div>
                <span className="ml-2 font-mono text-[10px] text-muted-foreground">
                  {page.url}
                </span>
              </div>

              <div className="p-4 sm:p-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {page.name}
                  </span>
                  {page.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="space-y-3">
                  {page.testimonials.map((t, ti) => (
                    <div
                      key={ti}
                      className="rounded-lg border border-border/50 bg-background/50 p-3"
                    >
                      <div className="mb-1 flex gap-0.5">
                        {Array.from({ length: t.rating }).map((_, si) => (
                          <Star
                            key={si}
                            className="size-3 fill-accent text-accent"
                          />
                        ))}
                      </div>
                      <p className="mb-1 text-xs leading-relaxed text-foreground/80">
                        &ldquo;{t.text}&rdquo;
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        — {t.author}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
