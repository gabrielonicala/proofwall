# Mobile-Responsive Wall & Form Builders

**Date:** 2026-03-16
**Status:** Approved
**Scope:** `src/app/dashboard/walls/[id]/page.tsx`, `src/app/dashboard/forms/[id]/page.tsx`

## Problem

The wall builder and form builder use a rigid side-by-side layout (fixed-width config panel + flex-1 preview). On mobile (<640px), the config panel consumes the full viewport width, the preview is invisible, and the Save button is pushed off-screen.

## Solution

Make both builder pages mobile-responsive with a collapsible config drawer, matching the existing sidebar collapse pattern.

## Design

### 1. Responsive Top Bar

**Mobile (<640px):**
- Hide preview size toggles (Desktop/Tablet/Mobile) — irrelevant on mobile
- Name input gets `min-w-0` to prevent overflow
- Save button collapses to icon-only (no text label)
- New **Settings button** (`SlidersHorizontal` icon) appears to the left of Save — opens the config drawer
- Layout: `[Back] [Name...] [Settings] [Save]`

**Desktop (>=640px):**
- No changes to current layout
- Settings button is hidden (`hidden sm:hidden` — never shown on desktop)

### 2. Collapsible Config Panel

**State:** `configOpen` boolean, defaults to `false`.

**Mobile (<640px):**
- Config panel is hidden by default — user sees full live preview
- Settings button sets `configOpen = true`
- Panel slides in from the left as a **full-width overlay** using Framer Motion `AnimatePresence`
- Backdrop: `bg-background/50 backdrop-blur-sm` (same as sidebar mobile pattern)
- Panel has a close button (X icon) at the top
- Tapping backdrop also dismisses the panel
- Panel is `fixed inset-0 z-50` with `overflow-y-auto`

**Desktop (>=640px):**
- Config panel is always visible in the normal side-by-side flex layout
- `configOpen` state is ignored — panel visibility is controlled purely by responsive classes
- The panel keeps its current `w-72` (wall) / `w-80` (form) fixed width

### 3. Animation

Uses the same Framer Motion pattern as the existing sidebar:

```tsx
// Backdrop
<AnimatePresence>
  {configOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm sm:hidden"
      onClick={() => setConfigOpen(false)}
    />
  )}
</AnimatePresence>

// Panel
<AnimatePresence>
  {configOpen && (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="fixed inset-y-0 left-0 z-50 w-full overflow-y-auto bg-background p-4 sm:hidden"
    >
      {/* Close button + config content */}
    </motion.div>
  )}
</AnimatePresence>
```

On desktop, the panel renders in its normal position using the existing markup — the mobile drawer markup is only visible on `sm:hidden`.

### 4. Files Changed

| File | Changes |
|---|---|
| `src/app/dashboard/walls/[id]/page.tsx` | Add `configOpen` state, responsive top bar, mobile drawer for config panel |
| `src/app/dashboard/forms/[id]/page.tsx` | Same changes as wall editor |

### 5. What Does NOT Change

- Desktop layout — identical to current
- Config panel content — all controls remain the same
- Save/create flow — unchanged
- Preview rendering — unchanged
- No new components or files — changes are self-contained in the two editor pages
