# Stripe Billing & Plan Enforcement Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Stripe-powered billing with three subscription tiers (Free/Pro/Business), enforce plan limits throughout the dashboard, and implement the missing paid-tier features (export, white-label embeds, API access).

**Architecture:** Stripe Checkout for payment, Stripe Customer Portal for subscription management, Stripe webhooks for lifecycle events. Plan state stored on the `projects` table as a `plan` enum column; a separate `subscriptions` table stores Stripe metadata. A centralized `src/lib/plans.ts` module defines limits and provides gate-checking functions used by both server actions and UI components. The `useProject` hook is extended with plan-aware helpers via a new `usePlan` hook.

**Tech Stack:** Stripe SDK (`stripe` npm package), Next.js Route Handlers for webhooks/checkout/portal, Supabase for persistence, existing server action patterns for enforcement.

---

## Codebase Context

### Current State
- **Database:** `projects` table has no plan/subscription columns. No `subscriptions` table exists.
- **Auth pattern:** Server actions use `authorizeProjectMember(projectId, requiredRoles?)` which returns `{ supabase, user, role }`.
- **Project context:** `useProject()` hook provides `{ project, loading, refetch }`. Type is `Tables<"projects">`.
- **Env vars:** Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` exist in `.env.local`.
- **No test runner** is configured (no jest/vitest). Testing is manual + Stripe CLI.

### Pricing Tiers (from `src/components/landing/pricing.tsx`)

| Feature | Free | Pro ($29/mo) | Business ($79/mo) |
|---------|------|-------------|-------------------|
| Testimonials | 15 | Unlimited | Unlimited |
| Walls | 3 | Unlimited | Unlimited |
| Collection forms | 1 | Unlimited | Unlimited |
| Display styles | All 8 | All 8 | All 8 |
| ProofWall branding | Required | Removable | Removable |
| Custom colors/fonts | No | Yes | Yes |
| View analytics | No | Yes | Yes |
| Priority support | No | Yes | Yes |
| Team seats | 1 (owner only) | 3 | Unlimited |
| White-label embeds | No | No | Yes |
| Custom domain for forms | No | No | Yes |
| API access | No | No | Yes |
| CSV/JSON export | No | No | Yes |

### Key Files Reference

| Purpose | Path |
|---------|------|
| Supabase types | `src/lib/supabase/types.ts` |
| Server client | `src/lib/supabase/server.ts` |
| Browser client | `src/lib/supabase/client.ts` |
| Project hook | `src/hooks/use-project.tsx` |
| Dashboard actions | `src/app/dashboard/actions.ts` |
| Settings page | `src/app/dashboard/settings/page.tsx` |
| Settings actions | `src/app/dashboard/settings/actions.ts` |
| Dashboard layout | `src/app/dashboard/layout.tsx` |
| Middleware | `src/middleware.ts` |
| Pricing component | `src/components/landing/pricing.tsx` |
| Wall builder | `src/app/dashboard/walls/[id]/page.tsx` |
| Embed route | `src/app/embed/[id]/page.tsx` |

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `src/lib/plans.ts` | Plan definitions, limits, gate-check functions (`canCreateTestimonial`, `canCreateWall`, etc.) |
| `src/lib/stripe.ts` | Stripe SDK client initialization (server-side only) |
| `src/hooks/use-plan.tsx` | Client-side hook: current plan, limits, `canDo()` helpers, derived from `useProject` |
| `src/app/api/stripe/checkout/route.ts` | POST: Create Stripe Checkout Session for a given plan + billing interval |
| `src/app/api/stripe/webhook/route.ts` | POST: Handle Stripe webhook events (subscription lifecycle) |
| `src/app/api/stripe/portal/route.ts` | POST: Create Stripe Customer Portal session |
| `src/components/dashboard/upgrade-banner.tsx` | Reusable banner shown when a limit is hit, with CTA to upgrade |
| `src/app/dashboard/settings/billing-section.tsx` | Billing/subscription management UI within settings page |
| `src/app/api/export/route.ts` | GET: Export testimonials as CSV or JSON (Business plan only) |
| `supabase/migrations/20260313_add_billing.sql` | SQL migration: `plan` column on projects, `subscriptions` table, RLS policies |

### Modified Files

| File | Changes |
|------|---------|
| `src/lib/supabase/types.ts` | Add `plan` enum, `subscriptions` table types, update `projects` row type |
| `src/hooks/use-project.tsx` | Add `plan` to Project type (already comes from DB, just needs type update) |
| `src/app/dashboard/actions.ts` | Add limit checks before create operations (testimonials, walls, forms) |
| `src/app/dashboard/settings/page.tsx` | Add `<BillingSection>` component |
| `src/app/dashboard/settings/actions.ts` | Add `inviteMemberByEmail` seat-limit check |
| `src/components/landing/pricing.tsx` | Update CTAs to link to checkout for paid plans |
| `src/app/embed/[id]/page.tsx` | Conditionally hide ProofWall branding based on project plan |
| `src/app/dashboard/walls/[id]/page.tsx` | Add upgrade prompts for Pro/Business features |
| `src/app/dashboard/testimonials/page.tsx` | Show limit usage indicator, gate "Add" button |
| `src/app/dashboard/forms/page.tsx` | Gate form creation on plan |
| `src/middleware.ts` | Allow `/api/stripe/webhook` to bypass CSRF/auth checks |
| `.env.local` | Add Stripe env vars |

---

## Chunk 1: Foundation — Database, Stripe SDK, Plan Definitions

### Task 1.1: Stripe Account Setup & Environment Variables

**Files:**
- Modify: `.env.local`

This task is done outside the codebase (in the Stripe Dashboard), but the steps are documented here for completeness.

- [ ] **Step 1: Create Stripe products and prices in the Stripe Dashboard**

Go to https://dashboard.stripe.com (use test mode).

Create two Products:
1. **ProofWall Pro** — two Prices:
   - $29/month (recurring, monthly)
   - $23/month (recurring, yearly — i.e. $276/year)
2. **ProofWall Business** — two Prices:
   - $79/month (recurring, monthly)
   - $63/month (recurring, yearly — i.e. $756/year)

Note the Price IDs (e.g., `price_xxx`). You'll need all four.

- [ ] **Step 2: Create a Customer Portal configuration**

In Stripe Dashboard → Settings → Billing → Customer Portal:
- Enable "Cancel subscription"
- Enable "Switch plans" with all 4 prices
- Enable "Update payment method"
- Enable invoice history

- [ ] **Step 3: Add environment variables**

Add to `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_ANNUAL_PRICE_ID=price_...
STRIPE_BUSINESS_MONTHLY_PRICE_ID=price_...
STRIPE_BUSINESS_ANNUAL_PRICE_ID=price_...

# Supabase admin (needed for webhook handler)
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

The `STRIPE_WEBHOOK_SECRET` comes from Step 4.

- [ ] **Step 4: Install Stripe CLI and set up local webhook forwarding**

```bash
# Install Stripe CLI (https://stripe.com/docs/stripe-cli)
# Then forward webhooks to local dev server:
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This prints the webhook signing secret (`whsec_...`). Copy it to `.env.local` as `STRIPE_WEBHOOK_SECRET`.

- [ ] **Step 5: Install the Stripe npm package**

```bash
cd D:/ProofWall/proofwall && npm install stripe
```

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add stripe SDK dependency"
```

---

### Task 1.2: Database Migration — Plan Column & Subscriptions Table

**Files:**
- Create: `supabase/migrations/20260313_add_billing.sql`

- [ ] **Step 1: Write the migration SQL**

```sql
-- Add plan enum
CREATE TYPE public.plan AS ENUM ('free', 'pro', 'business');

-- Add plan column to projects (default free)
ALTER TABLE public.projects
  ADD COLUMN plan public.plan NOT NULL DEFAULT 'free';

-- Subscriptions table — stores Stripe metadata
CREATE TABLE public.subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  stripe_customer_id text NOT NULL,
  stripe_subscription_id text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'active',
  price_id text NOT NULL,
  interval text NOT NULL CHECK (interval IN ('month', 'year')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_subscriptions_project_id ON public.subscriptions(project_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);

-- RLS policies for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Project members can read their project's subscription
CREATE POLICY "Members can view subscription"
  ON public.subscriptions FOR SELECT
  USING (public.is_project_member(project_id, auth.uid()));

-- Only service role (webhooks) can insert/update/delete
-- No user-facing policies for write — all writes go through the webhook handler
-- using the service role key.
```

- [ ] **Step 2: Apply the migration**

```bash
# Option A: Via Supabase CLI
cd D:/ProofWall/proofwall && npx supabase db push

# Option B: Via Supabase Dashboard SQL Editor
# Copy-paste the SQL and run it
```

- [ ] **Step 3: Commit**

```bash
git add supabase/
git commit -m "feat: add plan column and subscriptions table"
```

---

### Task 1.3: Update TypeScript Types

**Files:**
- Modify: `src/lib/supabase/types.ts`

- [ ] **Step 1: Add plan enum to the Enums section**

Find the `Enums` section in `src/lib/supabase/types.ts` and add:

```typescript
plan: "free" | "pro" | "business"
```

alongside the existing enums (`project_role`, `testimonial_source`, `testimonial_status`, `wall_style`).

- [ ] **Step 2: Add `plan` column to the `projects` table Row/Insert/Update types**

In the `projects` table definition:
- `Row`: add `plan: Database["public"]["Enums"]["plan"]`
- `Insert`: add `plan?: Database["public"]["Enums"]["plan"]`
- `Update`: add `plan?: Database["public"]["Enums"]["plan"]`

- [ ] **Step 3: Add `subscriptions` table type**

Add a new `subscriptions` entry in the `Tables` section:

```typescript
subscriptions: {
  Row: {
    id: string
    project_id: string
    stripe_customer_id: string
    stripe_subscription_id: string
    status: string
    price_id: string
    interval: string
    current_period_start: string | null
    current_period_end: string | null
    cancel_at_period_end: boolean
    created_at: string
    updated_at: string
  }
  Insert: {
    id?: string
    project_id: string
    stripe_customer_id: string
    stripe_subscription_id: string
    status?: string
    price_id: string
    interval: string
    current_period_start?: string | null
    current_period_end?: string | null
    cancel_at_period_end?: boolean
    created_at?: string
    updated_at?: string
  }
  Update: {
    id?: string
    project_id?: string
    stripe_customer_id?: string
    stripe_subscription_id?: string
    status?: string
    price_id?: string
    interval?: string
    current_period_start?: string | null
    current_period_end?: string | null
    cancel_at_period_end?: boolean
    created_at?: string
    updated_at?: string
  }
  Relationships: [
    {
      foreignKeyName: "subscriptions_project_id_fkey"
      columns: ["project_id"]
      isOneToOne: false
      referencedRelation: "projects"
      referencedColumns: ["id"]
    }
  ]
}
```

- [ ] **Step 4: Verify the app still compiles**

```bash
cd D:/ProofWall/proofwall && npx tsc --noEmit
```

Expected: No new errors. The `plan` column is optional in Insert and Update, so existing code continues to work.

- [ ] **Step 5: Commit**

```bash
git add src/lib/supabase/types.ts
git commit -m "feat: add plan enum and subscriptions types"
```

---

### Task 1.4: Stripe Client & Plan Definitions Module

**Files:**
- Create: `src/lib/stripe.ts`
- Create: `src/lib/plans.ts`

- [ ] **Step 1: Create the Stripe server client**

Create `src/lib/stripe.ts`:

```typescript
import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  typescript: true,
});

/**
 * Maps plan + interval to Stripe Price IDs.
 * Set these in .env.local from your Stripe Dashboard.
 */
export const PRICE_IDS = {
  pro: {
    month: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
    year: process.env.STRIPE_PRO_ANNUAL_PRICE_ID!,
  },
  business: {
    month: process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID!,
    year: process.env.STRIPE_BUSINESS_ANNUAL_PRICE_ID!,
  },
} as const;

/** Reverse lookup: Stripe Price ID → plan name */
export function planFromPriceId(priceId: string): "pro" | "business" | null {
  for (const [plan, intervals] of Object.entries(PRICE_IDS)) {
    if (Object.values(intervals).includes(priceId)) {
      return plan as "pro" | "business";
    }
  }
  return null;
}
```

- [ ] **Step 2: Create the plan definitions and gate-check module**

Create `src/lib/plans.ts`:

```typescript
import type { Database } from "@/lib/supabase/types";

type Plan = Database["public"]["Enums"]["plan"];

export interface PlanLimits {
  maxTestimonials: number;   // -1 = unlimited
  maxWalls: number;
  maxForms: number;
  maxTeamSeats: number;
  canRemoveBranding: boolean;
  canCustomizeColors: boolean;
  hasAnalytics: boolean;
  hasWhiteLabel: boolean;
  hasCustomFormDomain: boolean;
  hasApiAccess: boolean;
  hasExport: boolean;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    maxTestimonials: 15,
    maxWalls: 3,
    maxForms: 1,
    maxTeamSeats: 1,
    canRemoveBranding: false,
    canCustomizeColors: false,
    hasAnalytics: false,
    hasWhiteLabel: false,
    hasCustomFormDomain: false,
    hasApiAccess: false,
    hasExport: false,
  },
  pro: {
    maxTestimonials: -1,
    maxWalls: -1,
    maxForms: -1,
    maxTeamSeats: 3,
    canRemoveBranding: true,
    canCustomizeColors: true,
    hasAnalytics: true,
    hasWhiteLabel: false,
    hasCustomFormDomain: false,
    hasApiAccess: false,
    hasExport: false,
  },
  business: {
    maxTestimonials: -1,
    maxWalls: -1,
    maxForms: -1,
    maxTeamSeats: -1,
    canRemoveBranding: true,
    canCustomizeColors: true,
    hasAnalytics: true,
    hasWhiteLabel: true,
    hasCustomFormDomain: true,
    hasApiAccess: true,
    hasExport: true,
  },
};

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan];
}

/** Check if a count-based limit is exceeded. Returns true if allowed. */
export function withinLimit(limit: number, currentCount: number): boolean {
  if (limit === -1) return true; // unlimited
  return currentCount < limit;
}

/** Human-readable plan name */
export function planDisplayName(plan: Plan): string {
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}
```

- [ ] **Step 3: Verify compilation**

```bash
cd D:/ProofWall/proofwall && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/stripe.ts src/lib/plans.ts
git commit -m "feat: add Stripe client and plan definitions module"
```

---

### Task 1.5: Client-Side Plan Hook

**Files:**
- Create: `src/hooks/use-plan.tsx`

- [ ] **Step 1: Create the `usePlan` hook**

```typescript
"use client";

import { useMemo } from "react";
import { useProject } from "@/hooks/use-project";
import { getPlanLimits, type PlanLimits } from "@/lib/plans";
import type { Database } from "@/lib/supabase/types";

type Plan = Database["public"]["Enums"]["plan"];

interface UsePlanReturn {
  plan: Plan;
  limits: PlanLimits;
  loading: boolean;
}

export function usePlan(): UsePlanReturn {
  const { project, loading } = useProject();

  const plan: Plan = project?.plan ?? "free";
  const limits = useMemo(() => getPlanLimits(plan), [plan]);

  return { plan, limits, loading };
}
```

- [ ] **Step 2: Verify compilation**

```bash
cd D:/ProofWall/proofwall && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/hooks/use-plan.tsx
git commit -m "feat: add usePlan client hook"
```

---

## Chunk 2: Stripe Checkout, Webhooks & Customer Portal

### Task 2.1: Checkout Session API Route

**Files:**
- Create: `src/app/api/stripe/checkout/route.ts`

- [ ] **Step 1: Create the checkout route handler**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe, PRICE_IDS } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { plan, interval, projectId } = body as {
      plan: "pro" | "business";
      interval: "month" | "year";
      projectId: string;
    };

    // Validate inputs
    if (!plan || !interval || !projectId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!PRICE_IDS[plan]?.[interval]) {
      return NextResponse.json({ error: "Invalid plan or interval" }, { status: 400 });
    }

    // Verify user is owner of the project
    const { data: member } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!member || member.role !== "owner") {
      return NextResponse.json(
        { error: "Only the project owner can manage billing" },
        { status: 403 }
      );
    }

    // Check if there's already a Stripe customer for this project
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("project_id", projectId)
      .limit(1)
      .single();

    const priceId = PRICE_IDS[plan][interval];

    const sessionParams: Parameters<typeof stripe.checkout.sessions.create>[0] = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.nextUrl.origin}/dashboard/settings?billing=success`,
      cancel_url: `${req.nextUrl.origin}/dashboard/settings?billing=cancelled`,
      metadata: {
        project_id: projectId,
        user_id: user.id,
      },
      subscription_data: {
        metadata: {
          project_id: projectId,
        },
      },
    };

    // Reuse existing Stripe customer if we have one
    if (existingSub?.stripe_customer_id) {
      sessionParams.customer = existingSub.stripe_customer_id;
    } else {
      sessionParams.customer_email = user.email;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Verify compilation**

```bash
cd D:/ProofWall/proofwall && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/stripe/checkout/route.ts
git commit -m "feat: add Stripe Checkout session API route"
```

---

### Task 2.2: Webhook Handler

**Files:**
- Create: `src/app/api/stripe/webhook/route.ts`

This is the most critical piece — it handles Stripe subscription lifecycle events and keeps the database in sync.

- [ ] **Step 1: Create the webhook route handler**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { stripe, planFromPriceId } from "@/lib/stripe";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/types";
import Stripe from "stripe";

// Supabase admin client (bypasses RLS)
function createAdminClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) break;

        const projectId = session.metadata?.project_id;
        if (!projectId) {
          console.error("No project_id in checkout session metadata");
          break;
        }

        // Fetch the full subscription to get price details
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        const priceId = subscription.items.data[0]?.price.id;
        const plan = planFromPriceId(priceId ?? "");

        if (!plan) {
          console.error("Unknown price ID:", priceId);
          break;
        }

        // Upsert subscription record
        await supabase.from("subscriptions").upsert(
          {
            project_id: projectId,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            price_id: priceId!,
            interval: subscription.items.data[0]?.price.recurring?.interval ?? "month",
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          },
          { onConflict: "stripe_subscription_id" }
        );

        // Update project plan
        await supabase
          .from("projects")
          .update({ plan })
          .eq("id", projectId);

        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const projectId = subscription.metadata?.project_id;
        if (!projectId) break;

        const priceId = subscription.items.data[0]?.price.id;
        const plan = planFromPriceId(priceId ?? "");

        // Update subscription record
        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            price_id: priceId ?? "",
            interval: subscription.items.data[0]?.price.recurring?.interval ?? "month",
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          })
          .eq("stripe_subscription_id", subscription.id);

        // Update project plan (handles upgrades/downgrades)
        if (plan && subscription.status === "active") {
          await supabase
            .from("projects")
            .update({ plan })
            .eq("id", projectId);
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const projectId = subscription.metadata?.project_id;
        if (!projectId) break;

        // Update subscription status
        await supabase
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);

        // Downgrade project to free
        await supabase
          .from("projects")
          .update({ plan: "free" })
          .eq("id", projectId);

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string | null;
        if (!subscriptionId) break;

        // Mark subscription as past_due
        await supabase
          .from("subscriptions")
          .update({ status: "past_due" })
          .eq("stripe_subscription_id", subscriptionId);

        break;
      }
    }
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
```

- [ ] **Step 2: Update middleware to allow webhook requests without auth**

In `src/middleware.ts`, the Supabase middleware refreshes sessions for all requests. The webhook route sends raw POST bodies from Stripe (no auth cookies). Ensure the middleware doesn't interfere.

Find the updateSession call in `src/lib/supabase/middleware.ts` and add an early return for the webhook path. In the `updateSession` function, add this near the top:

```typescript
// Skip auth refresh for Stripe webhooks (no user session)
if (request.nextUrl.pathname === "/api/stripe/webhook") {
  return NextResponse.next({ request });
}
```

- [ ] **Step 3: Test with Stripe CLI**

```bash
# Terminal 1: Run the dev server
cd D:/ProofWall/proofwall && npm run dev

# Terminal 2: Forward Stripe events
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Terminal 3: Trigger a test event
stripe trigger checkout.session.completed
```

Expected: Webhook receives the event, logs processing, returns 200.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/stripe/webhook/route.ts src/lib/supabase/middleware.ts
git commit -m "feat: add Stripe webhook handler for subscription lifecycle"
```

---

### Task 2.3: Customer Portal API Route

**Files:**
- Create: `src/app/api/stripe/portal/route.ts`

- [ ] **Step 1: Create the portal route handler**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = (await req.json()) as { projectId: string };

    // Verify ownership
    const { data: member } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!member || member.role !== "owner") {
      return NextResponse.json(
        { error: "Only the project owner can manage billing" },
        { status: 403 }
      );
    }

    // Get Stripe customer ID
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("project_id", projectId)
      .limit(1)
      .single();

    if (!sub?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No active subscription found" },
        { status: 404 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${req.nextUrl.origin}/dashboard/settings`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Portal session error:", error);
    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Verify compilation**

```bash
cd D:/ProofWall/proofwall && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/stripe/portal/route.ts
git commit -m "feat: add Stripe Customer Portal API route"
```

---

## Chunk 3: Plan Enforcement in Server Actions

### Task 3.1: Add Plan Limit Checks to Server Actions

**Files:**
- Modify: `src/app/dashboard/actions.ts`

The key enforcement points are the **create** operations. We need to count existing resources and compare against plan limits before allowing creation.

- [ ] **Step 1: Add plan check helper to actions.ts**

Add this import and helper at the top of `src/app/dashboard/actions.ts`:

```typescript
import { getPlanLimits, withinLimit } from "@/lib/plans";
import type { Database } from "@/lib/supabase/types";

type Plan = Database["public"]["Enums"]["plan"];

/** Fetch the project's current plan and limits */
async function getProjectPlan(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  projectId: string
) {
  const { data } = await supabase
    .from("projects")
    .select("plan")
    .eq("id", projectId)
    .single();

  const plan = (data?.plan ?? "free") as Plan;
  return { plan, limits: getPlanLimits(plan) };
}
```

- [ ] **Step 2: Add limit check to testimonial creation**

Find any server action that creates a testimonial (e.g., `importTestimonials` or similar). Before the insert, add:

```typescript
// Check testimonial limit
const { limits } = await getProjectPlan(supabase, projectId);
if (limits.maxTestimonials !== -1) {
  const { count } = await supabase
    .from("testimonials")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  if (!withinLimit(limits.maxTestimonials, count ?? 0)) {
    return {
      error: `You've reached the limit of ${limits.maxTestimonials} testimonials on the Free plan. Upgrade to Pro for unlimited testimonials.`,
    };
  }
}
```

For `importTestimonials`, also check that `currentCount + rows.length` won't exceed the limit:

```typescript
if (limits.maxTestimonials !== -1) {
  const { count } = await supabase
    .from("testimonials")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  const remaining = limits.maxTestimonials - (count ?? 0);
  if (rows.length > remaining) {
    return {
      error: `You can only import ${remaining} more testimonial${remaining === 1 ? "" : "s"} on the Free plan. Upgrade to Pro for unlimited.`,
    };
  }
}
```

- [ ] **Step 3: Add limit check to wall creation**

Find the wall creation action or add a check where walls are created. Before insert:

```typescript
const { limits } = await getProjectPlan(supabase, projectId);
if (limits.maxWalls !== -1) {
  const { count } = await supabase
    .from("walls")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  if (!withinLimit(limits.maxWalls, count ?? 0)) {
    return {
      error: `You've reached the limit of ${limits.maxWalls} walls on the Free plan. Upgrade to Pro for unlimited walls.`,
    };
  }
}
```

- [ ] **Step 4: Add limit check to form creation**

Same pattern for collection forms:

```typescript
const { limits } = await getProjectPlan(supabase, projectId);
if (limits.maxForms !== -1) {
  const { count } = await supabase
    .from("collection_forms")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  if (!withinLimit(limits.maxForms, count ?? 0)) {
    return {
      error: `You've reached the limit of ${limits.maxForms} collection form${limits.maxForms === 1 ? "" : "s"} on the Free plan. Upgrade to Pro for unlimited forms.`,
    };
  }
}
```

- [ ] **Step 5: Add seat limit check to member invitations**

In `src/app/dashboard/settings/actions.ts`, find `inviteMemberByEmail` and add before the insert:

```typescript
import { getPlanLimits, withinLimit } from "@/lib/plans";

// Inside inviteMemberByEmail, after auth check:
const { data: project } = await supabase
  .from("projects")
  .select("plan")
  .eq("id", projectId)
  .single();

const limits = getPlanLimits((project?.plan ?? "free") as "free" | "pro" | "business");
if (limits.maxTeamSeats !== -1) {
  const { count } = await supabase
    .from("project_members")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  if (!withinLimit(limits.maxTeamSeats, count ?? 0)) {
    return {
      error: `Your ${project?.plan ?? "free"} plan allows ${limits.maxTeamSeats} team seat${limits.maxTeamSeats === 1 ? "" : "s"}. Upgrade to add more members.`,
    };
  }
}
```

- [ ] **Step 6: Verify compilation**

```bash
cd D:/ProofWall/proofwall && npx tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
git add src/app/dashboard/actions.ts src/app/dashboard/settings/actions.ts
git commit -m "feat: enforce plan limits in server actions"
```

---

### Task 3.2: Branding Enforcement on Embeds

**Files:**
- Modify: `src/app/embed/[id]/page.tsx`

- [ ] **Step 1: Look up the project's plan in the embed route**

In `src/app/embed/[id]/page.tsx`, the page already fetches the wall. After fetching the wall, also fetch the project's plan:

```typescript
// After fetching wall data:
const { data: project } = await supabase
  .from("projects")
  .select("plan")
  .eq("id", wall.project_id)
  .single();

const showBranding = project?.plan === "free";
```

- [ ] **Step 2: Conditionally render the ProofWall branding**

Find the branding element (typically a "Powered by ProofWall" link at the bottom of the embed). Wrap it:

```tsx
{showBranding && (
  <a
    href="https://proofwall.com"
    target="_blank"
    rel="noopener noreferrer"
    className="mt-4 block text-center text-xs text-muted-foreground opacity-60 hover:opacity-100 transition-opacity"
  >
    Powered by ProofWall
  </a>
)}
```

If no branding element currently exists, add one inside the embed page's main content wrapper, only shown for free-plan projects.

- [ ] **Step 3: Test manually**

1. Load an embed for a free-plan project → branding should appear.
2. Update the project's plan to 'pro' in the database → reload embed → branding should disappear.

- [ ] **Step 4: Commit**

```bash
git add src/app/embed/[id]/page.tsx
git commit -m "feat: conditionally show branding on embeds based on plan"
```

---

## Chunk 4: Billing UI

### Task 4.1: Upgrade Banner Component

**Files:**
- Create: `src/components/dashboard/upgrade-banner.tsx`

- [ ] **Step 1: Create the reusable upgrade banner**

```tsx
"use client";

import { ArrowUpRight } from "lucide-react";

interface UpgradeBannerProps {
  message: string;
  targetPlan?: "Pro" | "Business";
}

export function UpgradeBanner({
  message,
  targetPlan = "Pro",
}: UpgradeBannerProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
      <p className="flex-1 text-sm text-muted-foreground">{message}</p>
      <a
        href="/dashboard/settings?tab=billing"
        className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-gradient-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Upgrade to {targetPlan}
        <ArrowUpRight className="size-3" />
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/upgrade-banner.tsx
git commit -m "feat: add reusable upgrade banner component"
```

---

### Task 4.2: Billing Section in Settings

**Files:**
- Create: `src/app/dashboard/settings/billing-section.tsx`
- Modify: `src/app/dashboard/settings/page.tsx`

- [ ] **Step 1: Create the billing section component**

```tsx
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
            • {f}
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
```

- [ ] **Step 2: Add the billing section to the settings page**

In `src/app/dashboard/settings/page.tsx`, import and render `<BillingSection />`. Place it after the project settings section and before the team management section, separated by a divider:

```tsx
import { BillingSection } from "./billing-section";

// Inside the settings page JSX, add after project settings:
<div className="border-t border-border/50 pt-8">
  <BillingSection />
</div>
```

- [ ] **Step 3: Handle billing success/cancelled query params**

At the top of the settings page component, check for `?billing=success` or `?billing=cancelled` search params and show a brief notification:

```tsx
// If settings page is a server component, pass searchParams to a client wrapper.
// If it's already a client component, use useSearchParams():
import { useSearchParams } from "next/navigation";

const searchParams = useSearchParams();
const billingStatus = searchParams.get("billing");

// Render a success/cancelled banner at the top:
{billingStatus === "success" && (
  <div className="mb-6 rounded-lg border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
    Your subscription has been activated! It may take a moment to update.
  </div>
)}
{billingStatus === "cancelled" && (
  <div className="mb-6 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
    Checkout was cancelled. No charges were made.
  </div>
)}
```

- [ ] **Step 4: Verify compilation and test manually**

```bash
cd D:/ProofWall/proofwall && npx tsc --noEmit
```

Then start the dev server, go to `/dashboard/settings`, verify:
- Free plan shows "Free" with limits and upgrade cards for Pro and Business
- Clicking "Monthly" or "Annual" redirects to Stripe Checkout (in test mode)

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/settings/billing-section.tsx src/app/dashboard/settings/page.tsx
git commit -m "feat: add billing section to settings page"
```

---

### Task 4.3: Update Pricing Page CTAs

**Files:**
- Modify: `src/components/landing/pricing.tsx`

- [ ] **Step 1: Update CTA buttons for paid plans**

Currently all CTAs link to `/signup`. Keep "Start Free" linking to `/signup`. For Pro and Business, link to `/signup?plan=pro` and `/signup?plan=business` respectively (the signup flow can later auto-redirect to checkout):

```tsx
// In the plans array, update the Link href:
// For now, just append plan info to the signup URL.
// After signup, the onboarding flow can check for the plan query param
// and redirect to checkout.

// Update the Link in the pricing component:
<Link
  href={plan.price.monthly === 0 ? "/signup" : `/signup?plan=${plan.name.toLowerCase()}`}
  className={...}
>
  {plan.cta}
</Link>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/landing/pricing.tsx
git commit -m "feat: update pricing CTAs with plan query params"
```

---

### Task 4.4: Add Upgrade Prompts to Dashboard Pages

**Files:**
- Modify: `src/app/dashboard/testimonials/page.tsx`
- Modify: `src/app/dashboard/walls/[id]/page.tsx`
- Modify: `src/app/dashboard/forms/page.tsx`
- Modify: `src/app/dashboard/analytics/page.tsx`

These are lightweight additions — show the upgrade banner near resource creation buttons when limits are approached.

- [ ] **Step 1: Add usage indicator to testimonials page**

In the testimonials page, near the "Add Testimonial" button area, add:

```tsx
import { usePlan } from "@/hooks/use-plan";
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";

// Inside the component:
const { limits } = usePlan();

// After fetching testimonials count, near the create button:
{limits.maxTestimonials !== -1 && (
  <p className="text-xs text-muted-foreground">
    {testimonialCount} / {limits.maxTestimonials} testimonials used
  </p>
)}
{limits.maxTestimonials !== -1 && testimonialCount >= limits.maxTestimonials && (
  <UpgradeBanner message="You've reached your testimonial limit." />
)}
```

- [ ] **Step 2: Add analytics gate**

In the analytics page, if the plan doesn't include analytics, show:

```tsx
import { usePlan } from "@/hooks/use-plan";
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";

const { limits } = usePlan();

{!limits.hasAnalytics && (
  <UpgradeBanner message="Detailed analytics are available on the Pro plan." />
)}
```

Only gate the detailed analytics — basic view counts can remain visible to all plans.

- [ ] **Step 3: Gate wall creation similarly**

Same pattern as testimonials: show `X / Y walls used` and upgrade banner when limit reached.

- [ ] **Step 4: Gate form creation**

Same pattern: show `X / Y forms used` and upgrade banner.

- [ ] **Step 5: Verify compilation**

```bash
cd D:/ProofWall/proofwall && npx tsc --noEmit
```

- [ ] **Step 6: Commit**

```bash
git add src/app/dashboard/testimonials/page.tsx src/app/dashboard/walls/ src/app/dashboard/forms/page.tsx src/app/dashboard/analytics/page.tsx
git commit -m "feat: add plan limit indicators and upgrade prompts to dashboard"
```

---

## Chunk 5: Missing Paid Features

### Task 5.1: CSV/JSON Export (Business Plan)

**Files:**
- Create: `src/app/api/export/route.ts`
- Modify: `src/app/dashboard/testimonials/page.tsx` (add export button)

- [ ] **Step 1: Create the export API route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlanLimits } from "@/lib/plans";
import type { Database } from "@/lib/supabase/types";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const projectId = req.nextUrl.searchParams.get("projectId");
  const format = req.nextUrl.searchParams.get("format") ?? "csv";

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  // Verify membership
  const { data: member } = await supabase
    .from("project_members")
    .select("role")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: "Not a project member" }, { status: 403 });
  }

  // Check plan allows export
  const { data: project } = await supabase
    .from("projects")
    .select("plan")
    .eq("id", projectId)
    .single();

  const limits = getPlanLimits(
    (project?.plan ?? "free") as Database["public"]["Enums"]["plan"]
  );

  if (!limits.hasExport) {
    return NextResponse.json(
      { error: "Export is available on the Business plan" },
      { status: 403 }
    );
  }

  // Fetch all testimonials
  const { data: testimonials, error } = await supabase
    .from("testimonials")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 });
  }

  if (format === "json") {
    return new NextResponse(JSON.stringify(testimonials, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="testimonials-${Date.now()}.json"`,
      },
    });
  }

  // CSV format
  if (!testimonials || testimonials.length === 0) {
    return new NextResponse("No testimonials to export", { status: 200 });
  }

  const headers = Object.keys(testimonials[0]);
  const csvRows = [
    headers.join(","),
    ...testimonials.map((t) =>
      headers
        .map((h) => {
          const val = (t as Record<string, unknown>)[h];
          const str = val === null ? "" : String(val);
          // Escape CSV values
          return `"${str.replace(/"/g, '""')}"`;
        })
        .join(",")
    ),
  ];

  return new NextResponse(csvRows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="testimonials-${Date.now()}.csv"`,
    },
  });
}
```

- [ ] **Step 2: Add export buttons to testimonials page**

In `src/app/dashboard/testimonials/page.tsx`, add export buttons (only visible for Business plan):

```tsx
import { usePlan } from "@/hooks/use-plan";

const { limits } = usePlan();
const { project } = useProject();

// In the toolbar area:
{limits.hasExport && project && (
  <div className="flex gap-2">
    <a
      href={`/api/export?projectId=${project.id}&format=csv`}
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
    >
      Export CSV
    </a>
    <a
      href={`/api/export?projectId=${project.id}&format=json`}
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
    >
      Export JSON
    </a>
  </div>
)}
```

- [ ] **Step 3: Verify compilation**

```bash
cd D:/ProofWall/proofwall && npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/export/route.ts src/app/dashboard/testimonials/page.tsx
git commit -m "feat: add CSV/JSON export for Business plan"
```

---

### Task 5.2: White-Label Embeds (Business Plan)

**Files:**
- Modify: `src/app/embed/[id]/page.tsx`
- Modify: `src/app/dashboard/walls/[id]/page.tsx`

White-label means no ProofWall branding at all on embeds, plus the ability to use a custom stylesheet/colors. The branding removal was already handled in Task 3.2. This task adds the wall builder UI gate.

- [ ] **Step 1: Add white-label indicator in wall builder**

In the wall builder page (`src/app/dashboard/walls/[id]/page.tsx`), in the embed code panel area, show a note:

```tsx
import { usePlan } from "@/hooks/use-plan";

const { limits } = usePlan();

// Near the embed code panel:
{!limits.hasWhiteLabel && (
  <p className="mt-2 text-xs text-muted-foreground">
    Embeds include ProofWall branding.{" "}
    <a href="/dashboard/settings?tab=billing" className="text-primary underline">
      Upgrade to Business
    </a>{" "}
    for white-label embeds.
  </p>
)}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/walls/[id]/page.tsx
git commit -m "feat: add white-label embed indicator in wall builder"
```

---

### Task 5.3: API Access Placeholder (Business Plan)

**Files:**
- Create: `src/app/api/v1/testimonials/route.ts`

This creates a minimal public API endpoint for Business plan users. It's a starting point that can be expanded later.

- [ ] **Step 1: Create the public API route**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlanLimits } from "@/lib/plans";
import type { Database } from "@/lib/supabase/types";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized — API key required" }, { status: 401 });
  }

  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  // Verify membership
  const { data: member } = await supabase
    .from("project_members")
    .select("role")
    .eq("project_id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!member) {
    return NextResponse.json({ error: "Not a project member" }, { status: 403 });
  }

  // Check plan
  const { data: project } = await supabase
    .from("projects")
    .select("plan")
    .eq("id", projectId)
    .single();

  const limits = getPlanLimits(
    (project?.plan ?? "free") as Database["public"]["Enums"]["plan"]
  );

  if (!limits.hasApiAccess) {
    return NextResponse.json(
      { error: "API access is available on the Business plan" },
      { status: 403 }
    );
  }

  // Fetch testimonials
  const status = req.nextUrl.searchParams.get("status");
  let query = supabase
    .from("testimonials")
    .select("id, author_name, author_title, author_company, author_avatar_url, text, rating, source, status, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit") ?? "50"), 100);
  const offset = parseInt(req.nextUrl.searchParams.get("offset") ?? "0");
  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }

  return NextResponse.json({
    data,
    pagination: { limit, offset, count: data?.length ?? 0 },
  });
}
```

- [ ] **Step 2: Document the API in the docs page**

In `src/app/docs/page.tsx`, find the "Embedding Walls" section and add an "API Access" subsection (or update the existing docs content) with:

```
API Access (Business Plan)

GET /api/v1/testimonials?projectId=xxx
Query params: status, limit (max 100), offset
Returns: { data: [...], pagination: { limit, offset, count } }

Authentication: Requires an active session (cookie-based).
Available on Business plan only.
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/v1/testimonials/route.ts src/app/docs/page.tsx
git commit -m "feat: add public API endpoint for Business plan"
```

---

### Task 5.4: Custom Form Domain Placeholder (Business Plan)

**Files:**
- Modify: `src/app/dashboard/forms/[id]/page.tsx` (if exists, or the form creation flow)

This is a placeholder for the custom domain feature. The actual custom domain setup requires DNS configuration and is out of scope for this plan, but we should gate the UI properly.

- [ ] **Step 1: Add custom domain field to form settings (gated)**

In the form editor page, add a disabled field for custom domain:

```tsx
import { usePlan } from "@/hooks/use-plan";

const { limits } = usePlan();

// In the form settings section:
<div className="space-y-2">
  <label className="text-sm font-medium text-foreground">
    Form URL
  </label>
  <p className="text-sm text-muted-foreground">
    {limits.hasCustomFormDomain
      ? "Custom domain support — configure in project settings."
      : "Custom domains available on the Business plan."}
  </p>
</div>
```

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/forms/
git commit -m "feat: add custom domain placeholder for Business plan forms"
```

---

## Summary of All New/Modified Files

### New Files (10)
1. `supabase/migrations/20260313_add_billing.sql`
2. `src/lib/stripe.ts`
3. `src/lib/plans.ts`
4. `src/hooks/use-plan.tsx`
5. `src/app/api/stripe/checkout/route.ts`
6. `src/app/api/stripe/webhook/route.ts`
7. `src/app/api/stripe/portal/route.ts`
8. `src/components/dashboard/upgrade-banner.tsx`
9. `src/app/dashboard/settings/billing-section.tsx`
10. `src/app/api/export/route.ts`
11. `src/app/api/v1/testimonials/route.ts`

### Modified Files (10)
1. `.env.local` — Stripe keys
2. `src/lib/supabase/types.ts` — New types
3. `src/lib/supabase/middleware.ts` — Webhook bypass
4. `src/app/dashboard/actions.ts` — Limit checks
5. `src/app/dashboard/settings/actions.ts` — Seat limit
6. `src/app/dashboard/settings/page.tsx` — Billing section
7. `src/components/landing/pricing.tsx` — CTA updates
8. `src/app/embed/[id]/page.tsx` — Branding toggle
9. `src/app/dashboard/walls/[id]/page.tsx` — White-label indicator
10. `src/app/dashboard/testimonials/page.tsx` — Export buttons + limit display

---

## Execution Order

1. **Task 1.1** — Stripe setup + env vars (manual/external)
2. **Task 1.2** — Database migration
3. **Task 1.3** — TypeScript types update
4. **Task 1.4** — Stripe client + plans module
5. **Task 1.5** — Client-side plan hook
6. **Task 2.1** — Checkout API route
7. **Task 2.2** — Webhook handler
8. **Task 2.3** — Customer Portal route
9. **Task 3.1** — Server action limit enforcement
10. **Task 3.2** — Embed branding enforcement
11. **Task 4.1** — Upgrade banner component
12. **Task 4.2** — Billing settings UI
13. **Task 4.3** — Pricing page CTA update
14. **Task 4.4** — Dashboard upgrade prompts
15. **Task 5.1** — CSV/JSON export
16. **Task 5.2** — White-label indicator
17. **Task 5.3** — Public API endpoint
18. **Task 5.4** — Custom domain placeholder

Each task builds on the previous ones. Do not skip ahead.
