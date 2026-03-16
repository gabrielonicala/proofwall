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
- **Wall editor only:** Hide preview size toggles (Desktop/Tablet/Mobile) — irrelevant on mobile
- Name input gets `min-w-0` to prevent overflow
- Save button collapses to icon-only (no text label)
- New **Settings button** (`SlidersHorizontal` from `lucide-react`) appears to the left of Save — opens the config drawer. Visibility class: `sm:hidden` (visible by default, hidden at sm+).
- Layout: `[Back] [Name...] [Settings] [Save]`

**Desktop (>=640px):**
- No changes to current layout
- Settings button hidden via `sm:hidden`

### 2. Collapsible Config Panel

**State:** `configOpen` boolean, defaults to `false`.

**Mobile (<640px):**
- Config panel is hidden by default — user sees full live preview
- Settings button sets `configOpen = true`
- Panel slides in from the left as a **full-width overlay** using Framer Motion `AnimatePresence`
- Backdrop: `bg-background/50 backdrop-blur-sm` (same as sidebar mobile pattern)
- Panel has a close button (X icon) at the top
- Tapping backdrop also dismisses the panel
- `Escape` key also dismisses the panel (via `useEffect` keydown listener)
- Panel has `role="dialog"` and `aria-label="Configuration"`
- Panel is `fixed inset-0 z-50` with `overflow-y-auto`
- The drawer escapes the dashboard shell's `<main>` `p-6` padding by design — it's a full-viewport overlay, not constrained to the main content area

**Desktop (>=640px):**
- Config panel is always visible in the normal side-by-side flex layout
- `configOpen` state is ignored — panel visibility is controlled purely by responsive classes
- The panel keeps its current `w-72` (wall) / `w-80` (form) fixed width

### 3. Z-Index Hierarchy

The dashboard has this z-index stack:

| Element | z-index | Notes |
|---|---|---|
| Sidebar mobile backdrop | z-30 | `sm:hidden`, only when sidebar expanded |
| Sidebar `<aside>` | z-40 | `sticky top-0` |
| Config drawer backdrop | z-40 | `sm:hidden`, only when `configOpen` |
| Config drawer panel | z-50 | `sm:hidden`, only when `configOpen` |

On mobile, the sidebar is collapsed by default (64px icon-only), and its mobile backdrop only appears when the sidebar is explicitly expanded. The config drawer and sidebar expansion are independent actions — a user won't have both open simultaneously. The config drawer at z-50 safely overlays the collapsed sidebar at z-40.

Note: shadcn dialogs/popovers also use z-50, but those are not rendered while the config drawer is open (they're inside the config panel content, not behind it).

### 4. Animation

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
      role="dialog"
      aria-label="Configuration"
      className="fixed inset-y-0 left-0 z-50 w-full overflow-y-auto bg-background p-4 sm:hidden"
    >
      {/* Close button + config content */}
    </motion.div>
  )}
</AnimatePresence>
```

On desktop, the panel renders in its normal position using the existing markup — the mobile drawer markup is only rendered on mobile via `sm:hidden`.

### 5. Files Changed

| File | Changes |
|---|---|
| `src/app/dashboard/walls/[id]/page.tsx` | Add `configOpen` state, `SlidersHorizontal` + `X` icon imports, responsive top bar (hide preview toggles on mobile, icon-only Save, Settings button), mobile config drawer with backdrop/animation/Escape/aria, desktop panel hidden on mobile via `hidden sm:block` |
| `src/app/dashboard/forms/[id]/page.tsx` | Same as wall editor except: no preview size toggles to hide (form editor doesn't have them). Note: form editor's local `Toggle` component has a different signature (no `label` prop) — this is pre-existing and not changed by this spec. |

### 6. What Does NOT Change

- Desktop layout — identical to current
- Config panel content — all controls remain the same
- Save/create flow — unchanged
- Preview rendering — unchanged
- No new components or files — changes are self-contained in the two editor pages
