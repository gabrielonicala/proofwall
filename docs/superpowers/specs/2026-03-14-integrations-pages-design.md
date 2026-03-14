# Integrations Pages Design Spec

**Goal:** Add a marketing grid page at `/integrations` and individual tutorial pages for 4 platforms (HTML, React, WordPress, Webflow) that guide users through embedding Laudica testimonial walls on their site.

**Context:** Competitor ProofWall has an integrations page with 6 platform guides. We're starting with 4 platforms focused on a dev-heavy audience (Reddit promotion) with some no-code coverage.

---

## Architecture

Static content pages following the existing privacy/terms pattern. No data-driven routing, no MDX — just standalone Next.js page components with hardcoded content. Each page exports its own `Metadata` for SEO.

**New routes:**
- `/integrations` — grid page with platform cards
- `/integrations/html` — HTML/JavaScript tutorial
- `/integrations/react` — React tutorial
- `/integrations/wordpress` — WordPress tutorial
- `/integrations/webflow` — Webflow tutorial

**Modified files:**
- `src/components/landing/navbar.tsx` — add Integrations nav link
- `src/components/landing/footer.tsx` — add Integrations resource link
- `src/app/docs/page.tsx` — add cross-link in Embedding section

---

## Grid Page (`/integrations`)

**Layout:** Navbar + hero + card grid + Footer

**Hero area:**
- Title: "Integrations"
- Subtitle: "Add Laudica testimonial walls to any platform. Pick yours for a step-by-step guide."

**Card grid:**
- Responsive: 1 column on mobile, 2x2 on sm+, expandable to more columns later
- Each card: platform icon (inline SVG brand logos), platform name, one-line description, clickable link to tutorial

**Cards:**

| Platform | Slug | Description |
|----------|------|------------|
| HTML / JavaScript | `/integrations/html` | Add a testimonial wall to any website with a simple script tag |
| React | `/integrations/react` | Native component integration for React and Next.js apps |
| WordPress | `/integrations/wordpress` | Embed testimonial walls in your WordPress site |
| Webflow | `/integrations/webflow` | Display testimonial walls on your Webflow site |

---

## Tutorial Pages (`/integrations/[slug]`)

**Layout:** Navbar + single-column prose content + Footer (same as privacy/terms pages). `max-w-3xl mx-auto` with padding.

**Common elements:**
- Back link: "← All Integrations" linking to `/integrations`
- Page title (h1) + brief intro paragraph
- Numbered steps with code blocks in styled `<pre>` tags
- Tips/gotchas section at the bottom
- Next.js `Metadata` export

### HTML / JavaScript (`/integrations/html`)

**Steps:**
1. Copy your embed code from the Laudica wall builder
2. Paste the `<div>` + `<script>` tag into your HTML where you want the wall to appear
3. (Optional) Use the iframe method instead for stricter sandboxing

**Tips:** Domain allowlisting, responsive behavior, placement suggestions.

### React (`/integrations/react`)

**Steps:**
1. Copy the iframe embed URL from the wall builder
2. Create a component wrapping the iframe
3. Handle responsive sizing with the `laudica-resize` postMessage event

**Tips:** Dynamic wall IDs via props, Next.js/SSR considerations.

### WordPress (`/integrations/wordpress`)

**Steps:**
1. Open the page or post in the WordPress editor
2. Add a Custom HTML block (Block Editor) or switch to Text mode (Classic Editor)
3. Paste the Laudica embed snippet
4. Preview and publish

**Tips:** Widget area placement, both editor types supported.

### Webflow (`/integrations/webflow`)

**Steps:**
1. Add an Embed element from the Webflow Components panel
2. Paste the Laudica embed snippet into the code field
3. Publish the site

**Tips:** Global placement via site-level custom code, responsive considerations.

---

## Navigation Changes

**Navbar** (`src/components/landing/navbar.tsx`):
- Add `{ label: "Integrations", href: "/integrations" }` after Pricing in `navLinks`

**Footer** (`src/components/landing/footer.tsx`):
- Add `{ label: "Integrations", href: "/integrations" }` to `resourceLinks`

**Docs** (`src/app/docs/page.tsx`):
- Add a paragraph at the end of the "Embedding Walls" section: "For platform-specific guides, see our Integrations page." with link to `/integrations`

---

## Out of Scope

- npm package (`@laudica/react`) — future work
- Screenshots/images in tutorials — text-only for now
- Additional platforms (Shopify, Squarespace, Framer, etc.) — add later as needed
- Sidebar navigation within tutorial pages — content is short enough for single-column
- Data-driven routing — not needed for 4 pages
