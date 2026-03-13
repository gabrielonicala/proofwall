"use client";

import { useState } from "react";
import { usePlan } from "@/hooks/use-plan";
import { useProject } from "@/hooks/use-project";
import { planDisplayName } from "@/lib/plans";
import { CreditCard, ExternalLink, Loader2 } from "lucide-react";

export function BillingSection() {
  const { plan, limits } = usePlan();
  const { project } = useProject();
  const [loading, setLoading] = useState<string | null>(null);

  async function handleCheckout(targetPlan: "pro" | "business", interval: "month" | "year") {
    if (!project) return;
    setLoading(`${targetPlan}-${interval}`);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: targetPlan,
          interval,
          projectId: project.id,
        }),
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

  return (
    <section>
      <h2 className="mb-1 text-lg font-semibold text-foreground">
        Billing & Plan
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Manage your subscription and billing details.
      </p>

      {/* Current plan card */}
      <div className="mb-6 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current plan</p>
            <p className="text-xl font-semibold text-foreground">
              {planDisplayName(plan)}
            </p>
          </div>
          {plan !== "free" && (
            <button
              onClick={handleManageBilling}
              disabled={loading === "portal"}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted disabled:opacity-50"
            >
              {loading === "portal" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CreditCard className="size-4" />
              )}
              Manage Billing
              <ExternalLink className="size-3" />
            </button>
          )}
        </div>

        {/* Limits summary */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <LimitBadge
            label="Testimonials"
            value={limits.maxTestimonials === -1 ? "Unlimited" : `${limits.maxTestimonials}`}
          />
          <LimitBadge
            label="Walls"
            value={limits.maxWalls === -1 ? "Unlimited" : `${limits.maxWalls}`}
          />
          <LimitBadge
            label="Forms"
            value={limits.maxForms === -1 ? "Unlimited" : `${limits.maxForms}`}
          />
          <LimitBadge
            label="Team Seats"
            value={limits.maxTeamSeats === -1 ? "Unlimited" : `${limits.maxTeamSeats}`}
          />
        </div>
      </div>

      {/* Upgrade options (only show if not on Business) */}
      {plan !== "business" && (
        <div className="grid gap-4 sm:grid-cols-2">
          {plan === "free" && (
            <PlanCard
              name="Pro"
              monthlyPrice={29}
              annualPrice={23}
              features={[
                "Unlimited testimonials & walls",
                "Remove branding",
                "View analytics",
                "3 team seats",
              ]}
              onSelect={(interval) => handleCheckout("pro", interval)}
              loading={loading?.startsWith("pro") ?? false}
            />
          )}
          <PlanCard
            name="Business"
            monthlyPrice={79}
            annualPrice={63}
            features={[
              "Everything in Pro",
              "White-label embeds",
              "API access",
              "CSV/JSON export",
              "Unlimited team seats",
            ]}
            onSelect={(interval) => handleCheckout("business", interval)}
            loading={loading?.startsWith("business") ?? false}
          />
        </div>
      )}
    </section>
  );
}

function LimitBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function PlanCard({
  name,
  monthlyPrice,
  annualPrice,
  features,
  onSelect,
  loading,
}: {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  onSelect: (interval: "month" | "year") => void;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="mb-1 text-lg font-semibold text-foreground">{name}</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        ${monthlyPrice}/mo or ${annualPrice}/mo billed annually
      </p>
      <ul className="mb-5 space-y-1.5">
        {features.map((f) => (
          <li key={f} className="text-sm text-muted-foreground">
            &bull; {f}
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <button
          onClick={() => onSelect("month")}
          disabled={loading}
          className="flex-1 rounded-md bg-gradient-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="mx-auto size-4 animate-spin" />
          ) : (
            "Monthly"
          )}
        </button>
        <button
          onClick={() => onSelect("year")}
          disabled={loading}
          className="flex-1 rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
        >
          Annual (save 20%)
        </button>
      </div>
    </div>
  );
}
