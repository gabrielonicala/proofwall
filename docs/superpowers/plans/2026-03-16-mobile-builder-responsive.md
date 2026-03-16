# Mobile-Responsive Wall & Form Builders — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the wall builder and form builder usable on mobile by adding a collapsible config drawer and responsive top bar.

**Architecture:** Both editor pages get a `configOpen` state. On mobile (<640px), the config panel is hidden and rendered as a Framer Motion slide-in drawer triggered by a Settings button. On desktop, the layout is unchanged. The pattern mirrors the existing sidebar collapse in `src/components/dashboard/sidebar.tsx`.

**Tech Stack:** React state, Tailwind CSS responsive classes (`sm:`), Framer Motion `AnimatePresence`, Lucide icons.

**Spec:** `docs/superpowers/specs/2026-03-16-mobile-builder-responsive-design.md`

---

## Chunk 1: Wall Editor

### Task 1: Wall Editor — Add imports and state

**Files:**
- Modify: `src/app/dashboard/walls/[id]/page.tsx:1-71`

- [ ] **Step 1: Add new imports**

Add `SlidersHorizontal` and `X` to the lucide-react import (line 31-45), and add `motion, AnimatePresence` from framer-motion:

```tsx
// Add to the top of the file, after existing imports (around line 2):
import { motion, AnimatePresence } from "framer-motion";

// Add SlidersHorizontal and X to the lucide-react import block (lines 31-45):
import {
  ArrowLeft,
  Save,
  Loader2,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Copy,
  Check,
  Info,
  Code,
  Globe,
  ExternalLink,
  SlidersHorizontal,
  X,
} from "lucide-react";
```

- [ ] **Step 2: Add `configOpen` state**

Inside `WallEditorPage()`, after the existing `previewWidth` state (line 71), add:

```tsx
const [configOpen, setConfigOpen] = useState(false);
```

- [ ] **Step 3: Add Escape key handler**

After the `useEffect` that calls `fetchData()` (line 139), add:

```tsx
useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape" && configOpen) setConfigOpen(false);
  }
  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, [configOpen]);
```

- [ ] **Step 4: Verify the app still compiles**

Run: `cd D:/ProofWall/proofwall && npx next build --no-lint 2>&1 | tail -5`
Expected: Build succeeds (new imports and state are unused but harmless).

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/walls/\[id\]/page.tsx
git commit -m "feat(wall-editor): add mobile drawer imports and state"
```

---

### Task 2: Wall Editor — Responsive top bar

**Files:**
- Modify: `src/app/dashboard/walls/[id]/page.tsx:273-318` (the top bar JSX)

- [ ] **Step 1: Make the name input flexible**

Change the name input (line 281-286) to add `min-w-0` so it doesn't push other elements off-screen:

```tsx
<input
  value={name}
  onChange={(e) => setName(e.target.value)}
  className="min-w-0 border-none bg-transparent text-lg font-semibold outline-none placeholder:text-muted-foreground"
  placeholder="Wall name..."
/>
```

- [ ] **Step 2: Hide preview toggles on mobile**

Wrap the preview size toggles div (lines 290-309) with `hidden sm:flex` instead of `flex`:

```tsx
<div className="hidden rounded-lg border border-border sm:flex">
```

- [ ] **Step 3: Add Settings button (mobile only)**

Before the Save button (line 310), add:

```tsx
<button
  onClick={() => setConfigOpen(true)}
  className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden"
  aria-label="Open settings"
>
  <SlidersHorizontal className="size-4" />
</button>
```

- [ ] **Step 4: Make Save button icon-only on mobile**

Change the Save button text (line 316) to hide on mobile:

```tsx
<span className="hidden sm:inline">{isNew ? "Create Wall" : "Save"}</span>
```

The full save button becomes (note: `px-3` on mobile since text label is hidden, `sm:px-4` restores desktop padding):

```tsx
<button
  onClick={handleSave}
  disabled={saving || !name.trim()}
  className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 sm:px-4"
>
  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
  <span className="hidden sm:inline">{isNew ? "Create Wall" : "Save"}</span>
</button>
```

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/walls/\[id\]/page.tsx
git commit -m "feat(wall-editor): responsive top bar for mobile"
```

---

### Task 3: Wall Editor — Collapsible config panel

**Files:**
- Modify: `src/app/dashboard/walls/[id]/page.tsx:321-631` (editor body JSX)

- [ ] **Step 1: Extract config panel content into a variable**

The config panel content is the `<div className="space-y-6">` block inside the left panel (lines 325-614). Extract it to a `configContent` variable **declared inside `WallEditorPage()`, just before the `return` statement** (after the `previewWidthClass` const around line 268). This placement ensures all component state (`style`, `config`, `tags`, `tagFilter`, etc.) and helper functions (`updateConfig`, `setStyle`, etc.) are in scope.

```tsx
const configContent = (
  <div className="space-y-6">
    {/* All existing config sections — Style selector, Tag filter,
        Max testimonials, Sort, Animation, Show/Hide, Card Style,
        Border Radius, Font, Theme, Embed Code, Allowed Domains, Status */}
    {/* ... keep all existing JSX exactly as-is ... */}
  </div>
);
```

- [ ] **Step 2: Add mobile drawer backdrop and panel**

Right after the opening `{/* Editor body */}` comment and before the `<div className="flex flex-1 overflow-hidden">`, add the mobile drawer:

```tsx
{/* Mobile config drawer */}
<AnimatePresence>
  {configOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm sm:hidden"
      onClick={() => setConfigOpen(false)}
    />
  )}
</AnimatePresence>
<AnimatePresence>
  {configOpen && (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      role="dialog"
      aria-label="Wall configuration"
      className="fixed inset-y-0 left-0 z-50 w-full overflow-y-auto bg-background p-4 sm:hidden"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Settings</h2>
        <button
          onClick={() => setConfigOpen(false)}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close settings"
        >
          <X className="size-4" />
        </button>
      </div>
      {configContent}
    </motion.div>
  )}
</AnimatePresence>
```

- [ ] **Step 3: Hide desktop config panel on mobile**

Change the desktop config panel div (line 324) from:

```tsx
<div className="w-72 flex-shrink-0 overflow-y-auto border-r border-border p-4">
  <div className="space-y-6">
```

To:

```tsx
<div className="hidden w-72 flex-shrink-0 overflow-y-auto border-r border-border p-4 sm:block">
  {configContent}
</div>
```

The desktop panel now uses the same `configContent` variable and is hidden on mobile.

- [ ] **Step 4: Verify the build**

Run: `cd D:/ProofWall/proofwall && npx next build --no-lint 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/walls/\[id\]/page.tsx
git commit -m "feat(wall-editor): collapsible config drawer on mobile"
```

---

## Chunk 2: Form Editor

### Task 4: Form Editor — Add imports and state

**Files:**
- Modify: `src/app/dashboard/forms/[id]/page.tsx:1-34`

- [ ] **Step 1: Add new imports**

Add Framer Motion import after existing imports (around line 2):

```tsx
import { motion, AnimatePresence } from "framer-motion";
```

Add `SlidersHorizontal` and `X` to the lucide-react import (lines 13-20):

```tsx
import {
  ArrowLeft,
  Save,
  Loader2,
  GripVertical,
  Star,
  Upload,
  SlidersHorizontal,
  X,
} from "lucide-react";
```

- [ ] **Step 2: Add `configOpen` state**

Inside `FormEditorPage()`, after the `saving` state (line 33), add:

```tsx
const [configOpen, setConfigOpen] = useState(false);
```

- [ ] **Step 3: Add Escape key handler**

After the `useEffect` that calls `fetchData()` (line 64), add:

```tsx
useEffect(() => {
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape" && configOpen) setConfigOpen(false);
  }
  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
}, [configOpen]);
```

- [ ] **Step 4: Verify the app still compiles**

Run: `cd D:/ProofWall/proofwall && npx next build --no-lint 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/forms/\[id\]/page.tsx
git commit -m "feat(form-editor): add mobile drawer imports and state"
```

---

### Task 5: Form Editor — Responsive top bar

**Files:**
- Modify: `src/app/dashboard/forms/[id]/page.tsx:112-135` (the top bar JSX)

- [ ] **Step 1: Make the name input flexible**

Change the name input (line 120-125) to add `min-w-0`:

```tsx
<input
  value={name}
  onChange={(e) => setName(e.target.value)}
  className="min-w-0 border-none bg-transparent text-lg font-semibold outline-none placeholder:text-muted-foreground"
  placeholder="Form name..."
/>
```

- [ ] **Step 2: Add Settings button and make Save icon-only on mobile**

Replace the save button block (lines 127-134) with a wrapper containing both Settings and Save:

```tsx
<div className="flex items-center gap-2">
  <button
    onClick={() => setConfigOpen(true)}
    className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden"
    aria-label="Open settings"
  >
    <SlidersHorizontal className="size-4" />
  </button>
  {/* px-3 on mobile (icon-only), sm:px-4 restores desktop padding */}
  <button
    onClick={handleSave}
    disabled={saving || !name.trim()}
    className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 sm:px-4"
  >
    {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
    <span className="hidden sm:inline">{isNew ? "Create Form" : "Save"}</span>
  </button>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/forms/\[id\]/page.tsx
git commit -m "feat(form-editor): responsive top bar for mobile"
```

---

### Task 6: Form Editor — Collapsible config panel

**Files:**
- Modify: `src/app/dashboard/forms/[id]/page.tsx:137-295` (editor body JSX)

- [ ] **Step 1: Extract config panel content into a variable**

The config panel content is the `<div className="space-y-6">` block (lines 141-288). Extract it to a `configContent` variable **declared inside `FormEditorPage()`, just before the `return` statement** (after the loading guard around line 107). This placement ensures all component state (`config`, `setConfig`, `isActive`, etc.) is in scope.

**Note:** The form editor's local `Toggle` component (line 406) has a different signature than the wall editor's — it takes `{ checked, onChange }` with no `label` prop. The existing Status section wraps `Toggle` inside a `<label>` that provides the text. Keep this pattern exactly as-is.

```tsx
const configContent = (
  <div className="space-y-6">
    {/* All existing config sections — Welcome Message, Thank You Message,
        Fields, Branding, Form URL, After Submission, Status */}
    {/* ... keep all existing JSX exactly as-is ... */}
  </div>
);
```

- [ ] **Step 2: Add mobile drawer backdrop and panel**

After the `{/* Editor body */}` comment and before the `<div className="flex flex-1 overflow-hidden">`, add:

```tsx
{/* Mobile config drawer */}
<AnimatePresence>
  {configOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm sm:hidden"
      onClick={() => setConfigOpen(false)}
    />
  )}
</AnimatePresence>
<AnimatePresence>
  {configOpen && (
    <motion.div
      initial={{ x: "-100%" }}
      animate={{ x: 0 }}
      exit={{ x: "-100%" }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      role="dialog"
      aria-label="Form configuration"
      className="fixed inset-y-0 left-0 z-50 w-full overflow-y-auto bg-background p-4 sm:hidden"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Settings</h2>
        <button
          onClick={() => setConfigOpen(false)}
          className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close settings"
        >
          <X className="size-4" />
        </button>
      </div>
      {configContent}
    </motion.div>
  )}
</AnimatePresence>
```

- [ ] **Step 3: Hide desktop config panel on mobile**

Change the desktop config panel div (line 140) from:

```tsx
<div className="w-80 flex-shrink-0 overflow-y-auto border-r border-border p-4">
  <div className="space-y-6">
```

To:

```tsx
<div className="hidden w-80 flex-shrink-0 overflow-y-auto border-r border-border p-4 sm:block">
  {configContent}
</div>
```

- [ ] **Step 4: Verify the build**

Run: `cd D:/ProofWall/proofwall && npx next build --no-lint 2>&1 | tail -5`
Expected: Build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/app/dashboard/forms/\[id\]/page.tsx
git commit -m "feat(form-editor): collapsible config drawer on mobile"
```

---

## Chunk 3: Manual Verification

### Task 7: Visual verification on mobile viewport

- [ ] **Step 1: Start dev server**

Run: `cd D:/ProofWall/proofwall && npm run dev`

- [ ] **Step 2: Test wall editor on mobile viewport**

Open the wall editor in browser. Use devtools to resize to 375px width. Verify:
- Config panel is hidden, preview fills the screen
- Top bar shows: Back, name, Settings icon, Save icon (no text labels)
- Preview size toggles are hidden
- Tapping Settings opens the config drawer full-width with slide animation
- Drawer has "Settings" header with X close button
- Tapping backdrop closes the drawer
- Pressing Escape closes the drawer
- All config controls work inside the drawer
- Save button works

- [ ] **Step 3: Test form editor on mobile viewport**

Same checks as step 2 but on the form editor page. Verify:
- Top bar shows: Back, name, Settings icon, Save icon
- Config drawer opens with all form settings
- Form preview is visible when drawer is closed

- [ ] **Step 4: Test desktop is unchanged**

Resize to 1280px width. Verify:
- Wall editor: side-by-side layout with config panel + preview, preview toggles visible, Save has text label, no Settings button visible
- Form editor: same side-by-side layout, no Settings button visible

- [ ] **Step 5: Final commit (if any tweaks needed)**

```bash
git add -A
git commit -m "fix: polish mobile builder responsive tweaks"
```
