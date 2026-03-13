# Billing UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move billing from a hidden Settings section to a dedicated `/dashboard/billing` page with landing-page-quality visuals, usage stats, and sidebar navigation.

**Architecture:** New billing page mirrors the landing pricing component (`src/components/landing/pricing.tsx`) with plan-aware card states (current/upgrade/downgrade). A new `useUsageStats()` hook fetches Supabase counts for the usage row. Sidebar gets a new nav entry. Settings gets a minimal plan reference replacing the full `BillingSection`.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS v4, Framer Motion, Supabase client, Stripe (existing API routes)

**Spec:** `docs/superpowers/specs/2026-03-14-billing-ui-redesign-design.md`

---

## Chunk 1: Data Layer & Navigation

### Task 1: Create `useUsageStats` hook

**Files:**
- Create: `src/hooks/use-usage-stats.tsx`

This hook fetches current usage counts from Supabase for the active project. It follows the same pattern as `src/hooks/use-plan.tsx` (a `"use client"` hook that consumes `useProject()`).

- [ ] **Step 1: Create the hook file**

```tsx
// src/hooks/use-usage-stats.tsx
"use client";

import { useEffect, useState } from "react";
import { useProject } from "@/hooks/use-project";
import { createClient } from "@/lib/supabase/client";

interface UsageStats {
  testimonials: number;
  walls: number;
  forms: number;
  seats: number;
}

interface UseUsageStatsReturn {
  stats: UsageStats;
  loading: boolean;
}

export function useUsageStats(): UseUsageStatsReturn {
  const { project } = useProject();
  const [stats, setStats] = useState<UsageStats>({
    testimonials: 0,
    walls: 0,
    forms: 0,
    seats: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!project) return;

    async function fetchCounts() {
      const supabase = createClient();

      const [testimonials, walls, forms, seats] = await Promise.all([
        supabase
          .from("testimonials")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project!.id),
        supabase
          .from("walls")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project!.id),
        supabase
          .from("collection_forms")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project!.id),
        supabase
          .from("project_members")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project!.id),
      ]);

      setStats({
        testimonials: testimonials.count ?? 0,
        walls: walls.count ?? 0,
        forms: forms.count ?? 0,
        seats: seats.count ?? 0,
      });
      setLoading(false);
    }

    fetchCounts();
  }, [project]);

  return { stats, loading };
}
```

- [ ] **Step 2: Verify it compiles**

Run: `cd D:/ProofWall/proofwall && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `use-usage-stats.tsx`

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-usage-stats.tsx
git commit -m "feat: add useUsageStats hook for billing page usage row"
```

---

### Task 2: Add Billing link to sidebar

**Files:**
- Modify: `src/components/dashboard/sidebar.tsx:9-37`

Insert a `CreditCard` import and a new nav link entry between Analytics and Settings.

- [ ] **Step 1: Add `CreditCard` to the Lucide import**

In `src/components/dashboard/sidebar.tsx`, add `CreditCard` to the import on line 9:

```tsx
// Change:
import {
  LayoutDashboard,
  MessageSquareQuote,
  Layers,
  FileText,
  Upload,
  BarChart3,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
} from "lucide-react";

// To:
import {
  LayoutDashboard,
  MessageSquareQuote,
  Layers,
  FileText,
  Upload,
  BarChart3,
  CreditCard,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
} from "lucide-react";
```

- [ ] **Step 2: Add the Billing nav link**

In `src/components/dashboard/sidebar.tsx`, insert the Billing entry between Analytics and Settings in the `navLinks` array (between lines 35-36):

```tsx
const navLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Testimonials", href: "/dashboard/testimonials", icon: MessageSquareQuote },
  { label: "Walls", href: "/dashboard/walls", icon: Layers },
  { label: "Forms", href: "/dashboard/forms", icon: FileText },
  { label: "Import", href: "/dashboard/import", icon: Upload },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];
```

- [ ] **Step 3: Verify it compiles**

Run: `cd D:/ProofWall/proofwall && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/sidebar.tsx
git commit -m "feat: add Billing link to dashboard sidebar"
```

---

### Task 3: Update Stripe return URLs

**Files:**
- Modify: `src/app/api/stripe/checkout/route.ts:60-61`
- Modify: `src/app/api/stripe/portal/route.ts:48`

Change the redirect URLs from `/dashboard/settings` to `/dashboard/billing`.

- [ ] **Step 1: Update checkout route return URLs**

In `src/app/api/stripe/checkout/route.ts`, change:

```tsx
success_url: `${req.nextUrl.origin}/dashboard/settings?billing=success`,
cancel_url: `${req.nextUrl.origin}/dashboard/settings?billing=cancelled`,
```

To:

```tsx
success_url: `${req.nextUrl.origin}/dashboard/billing?billing=success`,
cancel_url: `${req.nextUrl.origin}/dashboard/billing?billing=cancelled`,
```

- [ ] **Step 2: Update portal route return URL**

In `src/app/api/stripe/portal/route.ts`, change:

```tsx
return_url: `${req.nextUrl.origin}/dashboard/settings`,
```

To:

```tsx
return_url: `${req.nextUrl.origin}/dashboard/billing`,
```

- [ ] **Step 3: Verify it compiles**

Run: `cd D:/ProofWall/proofwall && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/app/api/stripe/checkout/route.ts src/app/api/stripe/portal/route.ts
git commit -m "fix: update Stripe return URLs to /dashboard/billing"
```

---

## Chunk 2: Billing Page

### Task 4: Create the billing page

**Files:**
- Create: `src/app/dashboard/billing/page.tsx`

**Reference:** `src/components/landing/pricing.tsx` for visual patterns. `src/app/dashboard/settings/billing-section.tsx` for checkout/portal handler logic.

This is the main deliverable. The page mirrors the landing pricing section with plan-aware card states.

- [ ] **Step 1: Create the billing page**

Create `src/app/dashboard/billing/page.tsx` with the following structure:

```tsx
"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, CreditCard, ExternalLink, Loader2, X } from "lucide-react";
import { usePlan } from "@/hooks/use-plan";
import { useProject } from "@/hooks/use-project";
import { useUsageStats } from "@/hooks/use-usage-stats";
import { planDisplayName } from "@/lib/plans";

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
          <span>
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
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
                <span className="text-4xl font-extrabold text-foreground">
                  ${annual ? p.price.annual : p.price.monthly}
                </span>
                {p.price.monthly > 0 ? (
                  <span className="text-sm text-muted-foreground">/mo</span>
                ) : (
                  <span className="ml-1 text-sm text-muted-foreground">
                    forever
                  </span>
                )}
                {annual && p.price.monthly > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    billed annually
                  </p>
                )}
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
```

- [ ] **Step 2: Verify it compiles**

Run: `cd D:/ProofWall/proofwall && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Verify it renders**

Run: `cd D:/ProofWall/proofwall && npm run build 2>&1 | tail -20`
Expected: Build succeeds with no errors for `/dashboard/billing` route

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/billing/page.tsx
git commit -m "feat: add dedicated billing page with landing-page-quality visuals"
```

---

## Chunk 3: Settings Cleanup

### Task 5: Simplify Settings page

**Files:**
- Modify: `src/app/dashboard/settings/page.tsx:1-59, 294-316, 388-391`
- Modify: `src/app/dashboard/settings/billing-section.tsx` (replace contents)

Replace the full `BillingSection` import and billing status banners in Settings with a simple single-line plan reference.

- [ ] **Step 1: Replace `billing-section.tsx` with a minimal plan row**

Replace the entire contents of `src/app/dashboard/settings/billing-section.tsx` with:

```tsx
"use client";

import Link from "next/link";
import { usePlan } from "@/hooks/use-plan";
import { planDisplayName } from "@/lib/plans";
import { ChevronRight } from "lucide-react";

export function BillingSection() {
  const { plan, loading } = usePlan();

  if (loading) {
    return (
      <div className="flex items-center justify-between py-1">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="h-5 w-24 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold">Billing & Plan</h2>
        <p className="text-sm text-muted-foreground">
          Current plan: <span className="font-medium text-foreground">{planDisplayName(plan)}</span>
        </p>
      </div>
      <Link
        href="/dashboard/billing"
        className="inline-flex items-center gap-1 text-sm text-primary transition-colors hover:text-primary/80"
      >
        Manage billing
        <ChevronRight className="size-4" />
      </Link>
    </div>
  );
}
```

- [ ] **Step 2: Remove billing status banners and `useSearchParams` from Settings**

In `src/app/dashboard/settings/page.tsx`:

1. Remove `useSearchParams` from the import on line 4
2. Remove the `Suspense` import from line 3 (keep the other imports)
3. Remove the `SettingsPage` wrapper function (lines 53-59) and rename `SettingsContent` to `SettingsPage`, making it the default export
4. Remove `const searchParams = useSearchParams();` and `const billingStatus = searchParams.get("billing");` (lines 64-65)
5. Remove the two billing status banner blocks (lines 307-316)

After changes, the top of the file should look like:

```tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useProject } from "@/hooks/use-project";
import {
  Settings,
  Users,
  Shield,
  Trash2,
  Plus,
  Mail,
  Loader2,
  AlertTriangle,
  Crown,
  X,
  UserMinus,
} from "lucide-react";
import { inviteMemberByEmail, deleteProject } from "./actions";
import { updateProjectSettings, removeMember } from "../actions";
import { BillingSection } from "./billing-section";

// ... (type definitions stay the same)

export default function SettingsPage() {
  const { project, loading: projectLoading, refetch } = useProject();
  const router = useRouter();
  // ... rest of component WITHOUT searchParams or billing banners
```

The `BillingSection` import stays — it now renders the minimal plan row.

- [ ] **Step 3: Verify it compiles**

Run: `cd D:/ProofWall/proofwall && npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Verify it builds**

Run: `cd D:/ProofWall/proofwall && npm run build 2>&1 | tail -20`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/settings/billing-section.tsx src/app/dashboard/settings/page.tsx
git commit -m "refactor: simplify Settings billing section to a plan reference link"
```

---

## Post-Implementation Verification

After all tasks are complete, verify the full flow:

1. **Navigation:** Billing link appears in sidebar between Analytics and Settings
2. **Billing page:** Shows three plan cards matching the landing page aesthetic
3. **Current plan:** Correct card shows "Current Plan" badge
4. **Usage stats:** Shows correct counts with progress bars
5. **Settings page:** Shows minimal plan reference with "Manage billing" link
6. **Stripe redirect:** After checkout, user lands on `/dashboard/billing?billing=success`
7. **Build:** `npm run build` passes without errors
