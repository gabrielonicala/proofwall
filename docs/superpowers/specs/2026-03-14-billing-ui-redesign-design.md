# Billing UI Redesign

## Problem

The billing & plan management is buried inside the Settings page, making it hard to find. The visual design is generic and doesn't match the polished landing page aesthetic.

## Goals

1. Make billing easily discoverable via dedicated sidebar link and page
2. Match the landing page pricing section's visual quality (DM Serif Display headings, gradient CTAs, Framer Motion animations, oklch color palette)
3. Show the user's current plan contextually within the familiar plan comparison layout
4. Surface usage stats to motivate upgrades naturally

## Design

### Navigation & Discoverability

**Sidebar:** Add a "Billing" link between Analytics and Settings in the dashboard sidebar. Uses `CreditCard` icon from Lucide. Routes to `/dashboard/billing`.

**Settings page:** Replace the current `BillingSection` with a single-line reference: current plan name + "Manage billing" link pointing to `/dashboard/billing`. Styled as a simple settings row, not a card.

### Billing Page (`/dashboard/billing/page.tsx`)

#### Header

- `font-display` (DM Serif Display) heading: "Your Plan"
- `text-gradient` treatment on a keyword
- Subtitle: "Manage your subscription and billing." in `text-muted-foreground`

#### Monthly/Annual Toggle

- Centered below header
- Same rounded-pill toggle as landing page pricing: `rounded-full bg-muted/50 p-1` container
- Active state: `bg-background text-foreground shadow-sm`
- Annual option shows green `-20%` badge

#### Plan Cards Grid

Three cards in a `md:grid-cols-3` layout, mirroring the landing page `Pricing` component:

- `rounded-2xl border` cards
- `font-display` plan names (Free, Pro, Business)
- Price display: `text-4xl font-extrabold` with `/mo` or `forever` suffix. When annual toggle is active, shows the per-month equivalent (e.g., `$23/mo`) with a small "billed annually" note below
- Check-mark feature lists with `text-success` colored `Check` icons
- Framer Motion staggered fade-in (`delay: i * 0.1`)

**Pro card (highlighted):**
- `border-primary/50 bg-card shadow-lg shadow-primary/5`
- Elevated with `md:-mt-4 md:mb-4`
- "Most Popular" badge: `bg-gradient-primary` pill positioned `absolute -top-3`

#### Current Plan Card Behavior

The card for the user's active plan gets modified:

- **"Current Plan" badge:** Same positioning as "Most Popular" but uses `bg-success` green background
- **CTA changes to "Manage Billing":** Opens Stripe Customer Portal via `/api/stripe/portal`
- **If Pro is both current AND highlighted:** Shows both "Most Popular" and "Current Plan" badges (Current Plan takes the `-top-3` position, Most Popular moves inline or is hidden)

#### Upgrade Card Behavior

Cards for plans above the current plan show upgrade CTAs:

- **Primary CTA:** `bg-gradient-primary` button for the selected interval (monthly or annual based on toggle)
- **Triggers Stripe Checkout** via `/api/stripe/checkout`
- Loading state shows `Loader2` spinner

#### Downgrade/Lower Plan Cards

Cards for plans below the current plan:

- CTA is removed or replaced with a muted "Included in your plan" text
- Card is slightly de-emphasized (lower opacity or muted border)

### Usage Stats Row

Below the plan cards, a horizontal row of four usage indicators.

**Data source:** Create a `useUsageStats()` hook that runs Supabase count queries against the following tables (filtered by `project_id`):
- `testimonials` → Testimonials count
- `walls` → Walls count
- `collection_forms` → Forms count
- `project_members` → Team Seats count

Returns `{ testimonials: number, walls: number, forms: number, seats: number, loading: boolean }`.

- **Items:** Testimonials, Walls, Forms, Team Seats
- **Display:** Label + "X/Y" count + thin progress bar
- **Progress bar:** `bg-primary` fill on `bg-muted` track
- **Warning state:** When usage > 80% of limit, bar color changes to `text-amber-500` (no `--warning` token exists in the design system)
- **Unlimited:** Shows "Unlimited" text, no progress bar

### Billing Status Banners

Moved from Settings page to billing page:

- Triggered by URL params: `?billing=success` and `?billing=cancelled`
- Success: Green banner with checkmark, "Your plan has been upgraded!"
- Cancelled: Muted banner, "Checkout was cancelled."
- Dismissible (click to close)

### Loading State

- Plan cards show skeleton shimmer animation while `usePlan()` resolves
- Prevents layout shift by maintaining card dimensions

### Edge Cases

- **Business plan user:** All three cards show. Business card has "Current Plan" badge and "Manage Billing" CTA. No upgrade path exists above it.
- **Free plan user:** Free card has "Current Plan" badge. Pro and Business cards show upgrade CTAs.
- **Pro plan user:** Pro card has "Current Plan" badge. Business card shows upgrade CTA. Free card is de-emphasized.

## Files to Create/Modify

### New Files
- `src/app/dashboard/billing/page.tsx` — Full billing page component
- `src/hooks/use-usage-stats.tsx` — Hook for fetching current usage counts from Supabase

### Modified Files
- `src/components/dashboard/sidebar.tsx` — Add Billing nav link
- `src/app/dashboard/settings/page.tsx` — Replace BillingSection with single-line plan reference, move `useSearchParams` billing logic to billing page. The `Suspense` wrapper can be removed from settings if no other code uses `useSearchParams` there
- `src/app/dashboard/settings/billing-section.tsx` — Delete or repurpose as the simple settings row

### Existing Files (reference only, no changes)
- `src/components/landing/pricing.tsx` — Visual reference for card styling
- `src/hooks/use-plan.tsx` — Used for plan/limits data
- `src/lib/plans.ts` — Plan limits and display names
- `src/app/api/stripe/checkout/route.ts` — Checkout endpoint (unchanged)
- `src/app/api/stripe/portal/route.ts` — Portal endpoint (unchanged)

## Notes

- The billing page inherits from the existing `src/app/dashboard/layout.tsx` — no additional layout file needed.
- Access control: All team roles can view the billing page. Checkout/portal CTAs call API routes that already verify project ownership server-side, so non-owners will get an error from the API, not from the UI.

## Non-Goals

- No changes to Stripe integration or API routes
- No changes to plan limits or pricing
- No changes to upgrade banners on other dashboard pages
- No mobile-specific layout (existing responsive grid handles this)
