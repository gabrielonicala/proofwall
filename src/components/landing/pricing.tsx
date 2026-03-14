"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: { monthly: 0, annual: 0 },
    desc: "Perfect for getting started",
    features: [
      "15 testimonials",
      "3 showcase walls",
      "All 8 display styles",
      "1 collection form",
      "Laudica branding on embeds",
    ],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Pro",
    price: { monthly: 29, annual: 23 },
    desc: "For growing businesses",
    features: [
      "Unlimited testimonials",
      "Unlimited walls",
      "Remove branding",
      "Custom colors & fonts",
      "View analytics",
      "Priority support",
      "Team access (3 seats)",
    ],
    cta: "Start Pro",
    highlight: true,
  },
  {
    name: "Business",
    price: { monthly: 79, annual: 63 },
    desc: "For teams at scale",
    features: [
      "Everything in Pro",
      "White-label embeds",
      "Custom domain for forms",
      "API access",
      "Unlimited team seats",
      "Export to CSV/JSON",
    ],
    cta: "Start Business",
    highlight: false,
  },
];

export function Pricing() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-16 md:py-20">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center sm:mb-12"
        >
          <h2
            className="font-display mb-4 tracking-tight"
            style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}
          >
            Simple, <span className="text-gradient">transparent</span> pricing
          </h2>
          <p className="mb-8 text-base text-muted-foreground sm:text-lg">
            Start free. Upgrade when you&apos;re ready.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-1 rounded-full bg-muted/50 p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                !annual
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                annual
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Annual{" "}
              <span className="text-xs text-success">-20%</span>
            </button>
          </div>
        </motion.div>

        <div className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-5 sm:gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              layout
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1, layout: { duration: 0.25, ease: "easeInOut" } }}
              className={`relative rounded-2xl border p-5 sm:p-6 md:p-8 ${
                plan.highlight
                  ? "border-primary/50 bg-card shadow-lg shadow-primary/5 md:-mt-4 md:mb-4"
                  : "border-border bg-card/50"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Most Popular
                </div>
              )}

              <h3 className="font-display mb-1 text-2xl text-foreground">
                {plan.name}
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">{plan.desc}</p>

              <div className="mb-6">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={annual ? "annual" : "monthly"}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="inline-block text-4xl font-extrabold text-foreground"
                  >
                    ${annual ? plan.price.annual : plan.price.monthly}
                  </motion.span>
                </AnimatePresence>
                {plan.price.monthly > 0 ? (
                  <span className="text-sm text-muted-foreground">/mo</span>
                ) : (
                  <span className="ml-1 text-sm text-muted-foreground">
                    forever
                  </span>
                )}
                <AnimatePresence initial={false}>
                  {annual && plan.price.monthly > 0 && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-2 inline-block overflow-hidden whitespace-nowrap text-sm text-muted-foreground/60 line-through"
                    >
                      ${plan.price.monthly}/mo
                    </motion.span>
                  )}
                </AnimatePresence>
                <AnimatePresence initial={false}>
                  {annual && plan.price.monthly > 0 && (
                    <motion.p
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 4 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden text-xs text-muted-foreground"
                    >
                      billed annually
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <Link
                href={plan.price.monthly === 0 ? "/signup" : `/signup?plan=${plan.name.toLowerCase()}`}
                className={`mb-6 block w-full rounded-lg py-2.5 text-center text-sm font-medium transition-opacity ${
                  plan.highlight
                    ? "bg-gradient-primary text-primary-foreground hover:opacity-90"
                    : "border border-border text-foreground hover:bg-muted"
                }`}
              >
                {plan.cta}
              </Link>

              <ul className="space-y-2.5">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="mt-0.5 size-4 flex-shrink-0 text-success" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          No credit card required · Cancel anytime
        </p>
      </div>
    </section>
  );
}
