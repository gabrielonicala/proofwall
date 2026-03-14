# Rebrand ProofWall → Laudica Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rename every occurrence of "ProofWall" / "proofwall" to "Laudica" / "laudica" across the entire codebase.

**Architecture:** Pure find-and-replace across ~24 source files. No structural changes. Logo text split becomes `Laud<gradient>ica</gradient>`. Email addresses become `support@laudica.com`. Embed code references become `laudica` prefixed. No database changes needed.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4

---

## File Map

| Category | Files | Change type |
|----------|-------|-------------|
| Package | `package.json` | name field |
| Metadata | `src/app/layout.tsx` | title, template |
| CSS comment | `src/app/globals.css` | comment text |
| Logo text (3 places) | `src/components/dashboard/sidebar.tsx`, `src/components/landing/navbar.tsx`, `src/components/landing/footer.tsx` | `Proof<gradient>Wall</gradient>` → `Laud<gradient>ica</gradient>` |
| Landing page copy | `src/components/landing/how-it-works.tsx`, `src/components/landing/smart-walls.tsx`, `src/components/landing/pricing.tsx`, `src/components/landing/footer.tsx` | Display text + email |
| Legal pages | `src/app/terms/page.tsx`, `src/app/privacy/page.tsx` | All references + email |
| Docs page | `src/app/docs/page.tsx` | Product name, embed code samples, package names |
| Sample data | `src/data/sample-testimonials.ts` | Testimonial text |
| Showcase components (8) | `src/components/showcase/cards-grid.tsx`, `carousel.tsx`, `fade-rotator.tsx`, `masonry-grid.tsx`, `minimal-list.tsx`, `orbit.tsx`, `spotlight-stack.tsx`, `ticker-tape.tsx`, `vertical-marquee.tsx` | "Powered by" footer |
| Embed | `src/app/embed/[id]/page.tsx`, `src/app/embed/[id]/layout.tsx`, `src/app/embed/[id]/embed-resize.tsx` | Branding, URLs, message type |
| Dashboard | `src/app/dashboard/billing/page.tsx`, `src/app/dashboard/walls/[id]/page.tsx` | Branding references, embed code snippets |

---

## Chunk 1: Core Identity

### Task 1: Package name and metadata

**Files:**
- Modify: `package.json:2`
- Modify: `src/app/layout.tsx:26-27`
- Modify: `src/app/globals.css:122`

- [ ] **Step 1: Update package.json name**

Change `"name": "proofwall"` → `"name": "laudica"`

- [ ] **Step 2: Update layout.tsx metadata**

```tsx
default: "Laudica — Social proof that sells",
template: "%s | Laudica",
```

- [ ] **Step 3: Update CSS comment**

Change `ProofWall Design System` → `Laudica Design System`

- [ ] **Step 4: Build to verify no breakage**

Run: `npm run build`
Expected: Clean build, no errors

- [ ] **Step 5: Commit**

```bash
git add package.json src/app/layout.tsx src/app/globals.css
git commit -m "chore: rename ProofWall to Laudica in package and metadata"
```

---

### Task 2: Logo text (3 locations)

**Files:**
- Modify: `src/components/dashboard/sidebar.tsx:86`
- Modify: `src/components/landing/navbar.tsx:39`
- Modify: `src/components/landing/footer.tsx:34`

All three currently render:
```tsx
Proof<span className="text-gradient">Wall</span>
```

Change all to:
```tsx
Laud<span className="text-gradient">ica</span>
```

- [ ] **Step 1: Update sidebar.tsx**
- [ ] **Step 2: Update navbar.tsx**
- [ ] **Step 3: Update footer.tsx**
- [ ] **Step 4: Build to verify**

Run: `npm run build`

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/sidebar.tsx src/components/landing/navbar.tsx src/components/landing/footer.tsx
git commit -m "chore: rebrand logo text to Laudica across sidebar, navbar, footer"
```

---

### Task 3: Logo SVG gradient ID

**Files:**
- Modify: `src/components/logo.tsx`

Update the gradient ID from `pw-grad` to `la-grad` (cosmetic, prevents confusion):

```tsx
<linearGradient id="la-grad" ...>
```
```tsx
<rect ... fill="url(#la-grad)" />
```

- [ ] **Step 1: Update gradient ID**
- [ ] **Step 2: Build to verify**
- [ ] **Step 3: Commit**

```bash
git add src/components/logo.tsx
git commit -m "chore: rename SVG gradient ID from pw-grad to la-grad"
```

---

## Chunk 2: Landing Page Copy

### Task 4: Landing page components

**Files:**
- Modify: `src/components/landing/how-it-works.tsx:42`
- Modify: `src/components/landing/smart-walls.tsx:13`
- Modify: `src/components/landing/pricing.tsx:18`
- Modify: `src/components/landing/footer.tsx:15,105`

- [ ] **Step 1: how-it-works.tsx**

```tsx
// Change:
How <span className="text-gradient">ProofWall</span> works
// To:
How <span className="text-gradient">Laudica</span> works
```

- [ ] **Step 2: smart-walls.tsx**

```tsx
// Change:
text: "ProofWall completely transformed our conversion rate.",
// To:
text: "Laudica completely transformed our conversion rate.",
```

- [ ] **Step 3: pricing.tsx**

```tsx
// Change:
"ProofWall branding on embeds",
// To:
"Laudica branding on embeds",
```

- [ ] **Step 4: footer.tsx — email and copyright**

```tsx
// Change:
{ label: "Support", href: "mailto:support@proofwall.com" },
// To:
{ label: "Support", href: "mailto:support@laudica.com" },

// Change:
&copy; {new Date().getFullYear()} ProofWall. All rights reserved.
// To:
&copy; {new Date().getFullYear()} Laudica. All rights reserved.
```

- [ ] **Step 5: Build to verify**
- [ ] **Step 6: Commit**

```bash
git add src/components/landing/how-it-works.tsx src/components/landing/smart-walls.tsx src/components/landing/pricing.tsx src/components/landing/footer.tsx
git commit -m "chore: rebrand landing page copy to Laudica"
```

---

### Task 5: Sample testimonials

**Files:**
- Modify: `src/data/sample-testimonials.ts:20,60,80,90`

Replace all 4 occurrences of "ProofWall" with "Laudica" in testimonial text strings.

- [ ] **Step 1: Update all 4 testimonial strings**
- [ ] **Step 2: Build to verify**
- [ ] **Step 3: Commit**

```bash
git add src/data/sample-testimonials.ts
git commit -m "chore: rebrand sample testimonials to Laudica"
```

---

## Chunk 3: Legal Pages

### Task 6: Terms of Service

**Files:**
- Modify: `src/app/terms/page.tsx` (~32 occurrences)

Replace all occurrences:
- `ProofWall` → `Laudica`
- `proofwall.com` → `laudica.com`
- `proofwall` → `laudica` (in email addresses)

- [ ] **Step 1: Replace all occurrences in terms/page.tsx**
- [ ] **Step 2: Build to verify**
- [ ] **Step 3: Commit**

```bash
git add src/app/terms/page.tsx
git commit -m "chore: rebrand Terms of Service to Laudica"
```

---

### Task 7: Privacy Policy

**Files:**
- Modify: `src/app/privacy/page.tsx` (~17 occurrences)

Same replacements as Task 6.

- [ ] **Step 1: Replace all occurrences in privacy/page.tsx**
- [ ] **Step 2: Build to verify**
- [ ] **Step 3: Commit**

```bash
git add src/app/privacy/page.tsx
git commit -m "chore: rebrand Privacy Policy to Laudica"
```

---

## Chunk 4: Docs, Embeds, Dashboard

### Task 8: Docs page

**Files:**
- Modify: `src/app/docs/page.tsx` (~18 occurrences)

Replace:
- `ProofWall` → `Laudica` (display text)
- `proofwall` → `laudica` (in code samples, package names, URLs)
- `<!-- ProofWall Embed -->` → `<!-- Laudica Embed -->`
- `id="proofwall-embed"` → `id="laudica-embed"`
- `data-container="#proofwall-embed"` → `data-container="#laudica-embed"`
- `cdn.proofwall.com` → `cdn.laudica.com`
- `app.proofwall.com` → `app.laudica.com`
- `@proofwall/react` → `@laudica/react`
- `{ ProofWall }` → `{ Laudica }` (React component in code sample)
- `<ProofWall` → `<Laudica` (JSX in code sample)

- [ ] **Step 1: Replace all occurrences**
- [ ] **Step 2: Build to verify**
- [ ] **Step 3: Commit**

```bash
git add src/app/docs/page.tsx
git commit -m "chore: rebrand docs page to Laudica"
```

---

### Task 9: Showcase "Powered by" footers (8 components)

**Files:**
- Modify: `src/components/showcase/cards-grid.tsx`
- Modify: `src/components/showcase/carousel.tsx`
- Modify: `src/components/showcase/fade-rotator.tsx`
- Modify: `src/components/showcase/masonry-grid.tsx`
- Modify: `src/components/showcase/minimal-list.tsx`
- Modify: `src/components/showcase/orbit.tsx`
- Modify: `src/components/showcase/spotlight-stack.tsx`
- Modify: `src/components/showcase/ticker-tape.tsx`
- Modify: `src/components/showcase/vertical-marquee.tsx`

Each has `Powered by ProofWall` → `Powered by Laudica`

- [ ] **Step 1: Update all 8 showcase components (9 files)**
- [ ] **Step 2: Build to verify**
- [ ] **Step 3: Commit**

```bash
git add src/components/showcase/
git commit -m "chore: rebrand 'Powered by' text in all showcase components"
```

---

### Task 10: Embed files

**Files:**
- Modify: `src/app/embed/[id]/page.tsx:211,224`
- Modify: `src/app/embed/[id]/layout.tsx:18`
- Modify: `src/app/embed/[id]/embed-resize.tsx:13`

Changes:
- `href="https://proofwall.com"` → `href="https://laudica.com"`
- `Powered by ProofWall` → `Powered by Laudica`
- `title: "ProofWall Embed"` → `title: "Laudica Embed"`
- `type: "proofwall-resize"` → `type: "laudica-resize"`

**Note:** The `proofwall-resize` message type in `embed-resize.tsx` is used by the embed script to communicate with the parent page. Also check `src/app/dashboard/walls/[id]/page.tsx` for the corresponding listener and update it there too.

- [ ] **Step 1: Update embed page, layout, and resize script**
- [ ] **Step 2: Build to verify**
- [ ] **Step 3: Commit**

```bash
git add src/app/embed/
git commit -m "chore: rebrand embed files to Laudica"
```

---

### Task 11: Dashboard pages

**Files:**
- Modify: `src/app/dashboard/billing/page.tsx:22`
- Modify: `src/app/dashboard/walls/[id]/page.tsx:498,583,818,822,826`

Changes:
- `"ProofWall branding on embeds"` → `"Laudica branding on embeds"`
- `label="ProofWall branding"` → `label="Laudica branding"`
- `Embeds include ProofWall branding.` → `Embeds include Laudica branding.`
- `data-proofwall=` → `data-laudica=`
- `title="ProofWall testimonials"` → `title="Laudica testimonials"`
- `function ProofWall()` → `function LaudicaEmbed()` (in code sample)

- [ ] **Step 1: Update billing page**
- [ ] **Step 2: Update wall builder page**
- [ ] **Step 3: Build to verify**
- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/billing/page.tsx src/app/dashboard/walls/[id]/page.tsx
git commit -m "chore: rebrand dashboard billing and wall builder to Laudica"
```

---

## Chunk 5: Final verification

### Task 12: Full grep check and build

- [ ] **Step 1: Grep for any remaining "proofwall" or "ProofWall" in src/**

Run: `grep -ri "proofwall\|proof wall" src/`
Expected: Zero results

- [ ] **Step 2: Full build**

Run: `npm run build`
Expected: Clean build

- [ ] **Step 3: Commit any stragglers**
