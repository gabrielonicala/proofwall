"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, CreditCard, ExternalLink, Loader2, X } from "lucide-react";
import { usePlan } from "@/hooks/use-plan";
import { useProject } from "@/hooks/use-project";
import { useUsageStats } from "@/hooks/use-usage-stats";

const plans = [
  {
    key: "free" as const,
    name: "Free",
    price: { monthly: 0, annual: 0 },
    desc: "Perfect for getting started",
    features: [
      "15 testimonials",
      "3 showcase walls",
      "All 8 display styles",
      "1 collection form",
      "ProofWall branding on embeds",
    ],
    highlight: false,
  },
  {
    key: "pro" as const,
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
    highlight: true,
  },
  {
    key: "business" as const,
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
    highlight: false,
  },
];

const planOrder = { free: 0, pro: 1, business: 2 };

export default function BillingPage() {
  return (
    <Suspense>
      <BillingContent />
    </Suspense>
  );
}

function BillingContent() {
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const { plan: currentPlan, limits, loading: planLoading } = usePlan();
  const { project } = useProject();
  const { stats, loading: statsLoading } = useUsageStats();
  const searchParams = useSearchParams();
  const billingStatus = searchParams.get("billing");

  async function handleCheckout(targetPlan: "pro" | "business") {
    if (!project) return;
    const interval = annual ? "year" : "month";
    setLoading(`${targetPlan}-checkout`);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan, interval, projectId: project.id }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start checkout");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  async function handleManageBilling() {
    if (!project) return;
    setLoading("portal");

    try {
      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: project.id }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to open billing portal");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  // Loading skeleton
  if (planLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-8 py-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-48 animate-pulse rounded-lg bg-muted" />
          <div className="mx-auto h-5 w-64 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="mx-auto h-10 w-56 animate-pulse rounded-full bg-muted" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-96 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl py-4">
      {/* Billing status banners */}
      {billingStatus && !bannerDismissed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-6 flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${
            billingStatus === "success"
              ? "border-success/30 bg-success/10 text-success"
              : "border-border bg-muted/30 text-muted-foreground"
          }`}
        >
          <span className="flex items-center gap-2">
            {billingStatus === "success" && <Check className="size-4" />}
            {billingStatus === "success"
              ? "Your plan has been upgraded! It may take a moment to update."
              : "Checkout was cancelled. No charges were made."}
          </span>
          <button
            onClick={() => setBannerDismissed(true)}
            className="ml-4 rounded p-0.5 transition-colors hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </motion.div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10 text-center"
      >
        <h1
          className="font-display mb-4 tracking-tight"
          style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)" }}
        >
          Your <span className="text-gradient">Plan</span>
        </h1>
        <p className="mb-8 text-base text-muted-foreground sm:text-lg">
          Manage your subscription and billing.
        </p>

        {/* Monthly/Annual toggle */}
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
            Annual <span className="text-xs text-success">-20%</span>
          </button>
        </div>
      </motion.div>

      {/* Plan cards */}
      <div className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-5 sm:gap-6 md:grid-cols-3">
        {plans.map((p, i) => {
          const isCurrent = currentPlan === p.key;
          const isUpgrade = planOrder[p.key] > planOrder[currentPlan];
          const isDowngrade = planOrder[p.key] < planOrder[currentPlan];

          return (
            <motion.div
              key={p.key}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1, layout: { duration: 0.25, ease: "easeInOut" } }}
              className={`relative rounded-2xl border p-5 sm:p-6 md:p-8 ${
                p.highlight
                  ? "border-primary/50 bg-card shadow-lg shadow-primary/5 md:-mt-4 md:mb-4"
                  : "border-border bg-card/50"
              } ${isDowngrade ? "opacity-60" : ""}`}
            >
              {/* Badges */}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-success px-3 py-1 text-xs font-medium text-white">
                  Current Plan
                </div>
              )}
              {p.highlight && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-gradient-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                  Most Popular
                </div>
              )}

              <h3 className="font-display mb-1 text-2xl text-foreground">
                {p.name}
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">{p.desc}</p>

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
                    ${annual ? p.price.annual : p.price.monthly}
                  </motion.span>
                </AnimatePresence>
                {p.price.monthly > 0 ? (
                  <span className="text-sm text-muted-foreground">/mo</span>
                ) : (
                  <span className="ml-1 text-sm text-muted-foreground">
                    forever
                  </span>
                )}
                <AnimatePresence initial={false}>
                  {annual && p.price.monthly > 0 && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-2 inline-block overflow-hidden whitespace-nowrap text-sm text-muted-foreground/60 line-through"
                    >
                      ${p.price.monthly}/mo
                    </motion.span>
                  )}
                </AnimatePresence>
                <AnimatePresence initial={false}>
                  {annual && p.price.monthly > 0 && (
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

              {/* CTA */}
              {isCurrent ? (
                currentPlan !== "free" ? (
                  <button
                    onClick={handleManageBilling}
                    disabled={loading === "portal"}
                    className="mb-6 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                  >
                    {loading === "portal" ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <CreditCard className="size-4" />
                    )}
                    Manage Billing
                    <ExternalLink className="size-3" />
                  </button>
                ) : (
                  <div className="mb-6 block w-full rounded-lg border border-border py-2.5 text-center text-sm font-medium text-muted-foreground">
                    Your current plan
                  </div>
                )
              ) : isUpgrade ? (
                <button
                  onClick={() => handleCheckout(p.key as "pro" | "business")}
                  disabled={loading?.endsWith("-checkout") ?? false}
                  className="mb-6 block w-full rounded-lg bg-gradient-primary py-2.5 text-center text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {loading === `${p.key}-checkout` ? (
                    <Loader2 className="mx-auto size-4 animate-spin" />
                  ) : (
                    `Upgrade to ${p.name}`
                  )}
                </button>
              ) : (
                <div className="mb-6 block w-full rounded-lg border border-border/50 py-2.5 text-center text-sm text-muted-foreground">
                  Included in your plan
                </div>
              )}

              <ul className="space-y-2.5">
                {p.features.map((f) => (
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
          );
        })}
      </div>

      {/* Usage stats row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mx-auto mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4"
      >
        <UsageStat
          label="Testimonials"
          current={stats.testimonials}
          max={limits.maxTestimonials}
          loading={statsLoading}
        />
        <UsageStat
          label="Walls"
          current={stats.walls}
          max={limits.maxWalls}
          loading={statsLoading}
        />
        <UsageStat
          label="Forms"
          current={stats.forms}
          max={limits.maxForms}
          loading={statsLoading}
        />
        <UsageStat
          label="Team Seats"
          current={stats.seats}
          max={limits.maxTeamSeats}
          loading={statsLoading}
        />
      </motion.div>

      <p className="mt-10 text-center text-sm text-muted-foreground">
        Cancel anytime · Questions? Contact support
      </p>
    </div>
  );
}

function UsageStat({
  label,
  current,
  max,
  loading,
}: {
  label: string;
  current: number;
  max: number;
  loading: boolean;
}) {
  const isUnlimited = max === -1;
  const percentage = isUnlimited ? 0 : max > 0 ? (current / max) * 100 : 0;
  const isWarning = !isUnlimited && percentage > 80;

  if (loading) {
    return (
      <div className="rounded-xl border border-border/50 bg-card/50 p-4">
        <div className="mb-2 h-3 w-16 animate-pulse rounded bg-muted" />
        <div className="h-5 w-12 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-4">
      <p className="mb-1 text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">
        {isUnlimited ? (
          "Unlimited"
        ) : (
          <>
            {current}
            <span className="text-muted-foreground">/{max}</span>
          </>
        )}
      </p>
      {!isUnlimited && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-all ${
              isWarning ? "bg-amber-500" : "bg-primary"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      )}
    </div>
  );
}
