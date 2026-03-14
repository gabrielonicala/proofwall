# Integrations Pages Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a marketing grid page at `/integrations` and 4 individual platform tutorial pages (HTML, React, WordPress, Webflow) for embedding Laudica testimonial walls.

**Architecture:** Static Next.js page components following the existing privacy/terms pattern. Each page is a standalone file with its own `Metadata` export. The grid page uses a responsive card layout linking to individual tutorial pages. Navigation is updated in navbar, footer, and docs.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, Lucide React icons

**Spec:** `docs/superpowers/specs/2026-03-14-integrations-pages-design.md`

---

## File Structure

**New files:**
- `src/app/integrations/page.tsx` — grid page with 4 platform cards
- `src/app/integrations/html/page.tsx` — HTML/JS embed tutorial
- `src/app/integrations/react/page.tsx` — React embed tutorial
- `src/app/integrations/wordpress/page.tsx` — WordPress embed tutorial
- `src/app/integrations/webflow/page.tsx` — Webflow embed tutorial

**Modified files:**
- `src/components/landing/navbar.tsx` — add Integrations nav link
- `src/components/landing/footer.tsx` — add Integrations resource link
- `src/app/docs/page.tsx` — add cross-link in Embedding section

---

## Chunk 1: Core Pages

### Task 1: Create the integrations grid page

**Files:**
- Create: `src/app/integrations/page.tsx`

- [ ] **Step 1: Create the grid page**

```tsx
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Integrations",
  description:
    "Add Laudica testimonial walls to any platform. Step-by-step guides for HTML, React, WordPress, Webflow, and more.",
};

const platforms = [
  {
    name: "HTML / JavaScript",
    slug: "html",
    description: "Add a testimonial wall to any website with a simple script tag.",
    icon: (
      <svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
        <line x1="12" y1="2" x2="12" y2="22" opacity="0.3" />
      </svg>
    ),
  },
  {
    name: "React",
    slug: "react",
    description: "Native component integration for React and Next.js apps.",
    icon: (
      <svg className="size-8" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="2.2" />
        <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(60 12 12)" />
        <ellipse cx="12" cy="12" rx="10" ry="4" fill="none" stroke="currentColor" strokeWidth="1.2" transform="rotate(120 12 12)" />
      </svg>
    ),
  },
  {
    name: "WordPress",
    slug: "wordpress",
    description: "Embed testimonial walls in your WordPress site.",
    icon: (
      <svg className="size-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zM3.009 12c0-1.065.192-2.083.54-3.025l2.97 8.136A8.997 8.997 0 013.01 12zm8.991 9a8.95 8.95 0 01-3.089-.548l3.282-9.531 3.36 9.207c.022.054.048.104.077.152A8.95 8.95 0 0112 21zm1.299-13.171c.658-.035 1.252-.105 1.252-.105.59-.07.521-.937-.068-.906 0 0-1.774.14-2.918.14-1.074 0-2.882-.14-2.882-.14-.59-.031-.658.871-.069.906 0 0 .56.07 1.148.105l1.705 4.674-2.396 7.184L5.601 8.829c.658-.035 1.252-.105 1.252-.105.59-.07.521-.937-.069-.906 0 0-1.773.14-2.917.14-.205 0-.448-.005-.7-.014A8.987 8.987 0 0112 3.009c2.24 0 4.281.82 5.854 2.176-.038-.002-.074-.009-.113-.009-1.074 0-1.836.937-1.836 1.943 0 .906.521 1.671 1.076 2.577.417.729.904 1.664.904 3.015 0 .934-.358 2.018-.833 3.529l-1.091 3.646L12 8.829l1.299-.001z" />
      </svg>
    ),
  },
  {
    name: "Webflow",
    slug: "webflow",
    description: "Display testimonial walls on your Webflow site.",
    icon: (
      <svg className="size-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.802 8.56s-1.94 5.97-2.073 6.39c-.047-.47-.793-6.39-.793-6.39C13.168 4.44 9.324 4.383 7.31 7.95c0 0-2.942 5.93-3.07 6.19.003-.53-.149-6.24-.149-6.24C3.844 4.062.61 3.14.61 3.14L0 6.48s2.467.53 2.586 3.33c.1 2.35.513 7.73.513 7.73.083 3.97 3.972 3.48 5.626.99 1.004-1.51 2.472-4.97 2.472-4.97s.776 3.42.943 3.97c.803 2.65 3.652 3.3 5.268.99.67-.96 3.04-5.3 3.04-5.3s.456 4.98.53 5.39c.294 1.64 2.48 2.94 4.14 1.37.37-.35.833-.93.833-.93l-.555-2.27s-.356.62-.787.38c-.376-.21-.42-1.01-.42-1.01s-.698-7.85-.72-8.21c-.15-2.49-3.138-3.49-4.965-.77 0 0-2.315 4.04-2.505 4.39.012-.41.823-6.39.823-6.39-.163-4.12-3.86-4.55-5.22-2.56z" />
      </svg>
    ),
  },
];

export default function IntegrationsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          {/* Hero */}
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Integrations
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Add Laudica testimonial walls to any platform. Pick yours for a
            step-by-step guide.
          </p>

          {/* Platform grid */}
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {platforms.map((p) => (
              <Link
                key={p.slug}
                href={`/integrations/${p.slug}`}
                className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-card/80"
              >
                <div className="flex-shrink-0 text-muted-foreground transition-colors group-hover:text-primary">
                  {p.icon}
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-foreground">
                    {p.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {p.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    View guide
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify the page renders**

Run: `npm run dev`
Open: `http://localhost:3000/integrations`
Expected: Grid page with 4 platform cards, title, subtitle, all links work (404 for now on individual pages).

- [ ] **Step 3: Commit**

```bash
git add src/app/integrations/page.tsx
git commit -m "feat: add integrations grid page"
```

---

### Task 2: Create the HTML/JavaScript tutorial page

**Files:**
- Create: `src/app/integrations/html/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "HTML / JavaScript Integration",
  description:
    "Add a Laudica testimonial wall to any website with a simple script tag. Step-by-step guide.",
};

const codeBlockClass =
  "overflow-x-auto rounded-lg bg-[#0d0d12] p-4 font-mono text-sm leading-relaxed text-muted-foreground";

export default function HtmlIntegrationPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <Link
            href="/integrations"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            All Integrations
          </Link>

          <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            HTML / JavaScript
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            The simplest way to add a Laudica testimonial wall to any website.
            Just copy and paste a script tag — no build tools or frameworks required.
          </p>

          <div className="mt-12 space-y-12 text-base leading-relaxed text-muted-foreground">
            {/* Step 1 */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                1. Copy your embed code
              </h2>
              <p>
                Open the{" "}
                <span className="font-medium text-foreground">wall builder</span>{" "}
                in your Laudica dashboard. Click the{" "}
                <span className="font-medium text-foreground">Embed Code</span>{" "}
                tab and select{" "}
                <span className="font-medium text-foreground">
                  HTML / JS
                </span>
                . Copy the snippet.
              </p>
            </section>

            {/* Step 2 */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                2. Paste into your HTML
              </h2>
              <p className="mb-4">
                Add the snippet wherever you want the testimonial wall to appear
                in your page:
              </p>
              <pre className={codeBlockClass}>
                <code>{`<!-- Laudica Testimonial Wall -->
<div id="laudica-embed"></div>
<script
  src="https://cdn.laudica.com/embed.js"
  data-wall-id="YOUR_WALL_ID"
  data-container="#laudica-embed"
  async
></script>`}</code>
              </pre>
              <p className="mt-4">
                Replace{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground">
                  YOUR_WALL_ID
                </code>{" "}
                with the ID shown in your wall builder.
              </p>
            </section>

            {/* Step 3 */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                3. Alternative: iframe embed
              </h2>
              <p className="mb-4">
                If you prefer a fully sandboxed embed or your hosting platform
                doesn&apos;t allow custom JavaScript, use an iframe instead:
              </p>
              <pre className={codeBlockClass}>
                <code>{`<iframe
  src="https://app.laudica.com/embed/YOUR_WALL_ID"
  width="100%"
  height="500"
  frameborder="0"
  style="border: none; max-width: 100%;"
  loading="lazy"
></iframe>`}</code>
              </pre>
            </section>

            {/* Tips */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                Tips
              </h2>
              <ul className="list-disc space-y-3 pl-5">
                <li>
                  <span className="font-medium text-foreground">
                    Domain allowlisting
                  </span>{" "}
                  — if you&apos;ve restricted your wall to specific domains in
                  the wall builder, make sure your site&apos;s domain is in the
                  list.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Responsive by default
                  </span>{" "}
                  — the embed automatically adapts to its container width. No
                  extra CSS needed.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Placement
                  </span>{" "}
                  — works in any location: landing pages, footers, sidebars,
                  dedicated testimonial pages.
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run dev`
Open: `http://localhost:3000/integrations/html`
Expected: Tutorial page with 3 steps and tips, back link to `/integrations`.

- [ ] **Step 3: Commit**

```bash
git add src/app/integrations/html/page.tsx
git commit -m "feat: add HTML/JS integration tutorial page"
```

---

### Task 3: Create the React tutorial page

**Files:**
- Create: `src/app/integrations/react/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "React Integration",
  description:
    "Integrate Laudica testimonial walls into your React or Next.js app. Step-by-step guide.",
};

const codeBlockClass =
  "overflow-x-auto rounded-lg bg-[#0d0d12] p-4 font-mono text-sm leading-relaxed text-muted-foreground";

export default function ReactIntegrationPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <Link
            href="/integrations"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            All Integrations
          </Link>

          <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            React
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Embed a Laudica testimonial wall as a native component in your React
            or Next.js application.
          </p>

          <div className="mt-12 space-y-12 text-base leading-relaxed text-muted-foreground">
            {/* Step 1 */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                1. Get your wall ID
              </h2>
              <p>
                Open the{" "}
                <span className="font-medium text-foreground">wall builder</span>{" "}
                in your Laudica dashboard. Click the{" "}
                <span className="font-medium text-foreground">Embed Code</span>{" "}
                tab — your wall ID is displayed at the top.
              </p>
            </section>

            {/* Step 2 */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                2. Create the embed component
              </h2>
              <p className="mb-4">
                Create a reusable component that wraps the Laudica iframe:
              </p>
              <pre className={codeBlockClass}>
                <code>{`interface LaudicaWallProps {
  wallId: string;
  className?: string;
}

export function LaudicaWall({ wallId, className }: LaudicaWallProps) {
  return (
    <iframe
      src={\`https://app.laudica.com/embed/\${wallId}\`}
      width="100%"
      height="500"
      frameBorder="0"
      style={{ border: "none", maxWidth: "100%" }}
      loading="lazy"
      className={className}
    />
  );
}`}</code>
              </pre>
            </section>

            {/* Step 3 */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                3. Use it in your app
              </h2>
              <p className="mb-4">
                Import and render the component anywhere in your app:
              </p>
              <pre className={codeBlockClass}>
                <code>{`import { LaudicaWall } from "./laudica-wall";

export default function TestimonialsPage() {
  return (
    <section>
      <h2>What our customers say</h2>
      <LaudicaWall wallId="YOUR_WALL_ID" />
    </section>
  );
}`}</code>
              </pre>
            </section>

            {/* Step 4 */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                4. Auto-resize (optional)
              </h2>
              <p className="mb-4">
                The Laudica embed sends a{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground">
                  laudica-resize
                </code>{" "}
                postMessage event with its content height. Listen for it to
                remove the fixed height:
              </p>
              <pre className={codeBlockClass}>
                <code>{`import { useEffect, useRef } from "react";

interface LaudicaWallProps {
  wallId: string;
  className?: string;
}

export function LaudicaWall({ wallId, className }: LaudicaWallProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type === "laudica-resize" && iframeRef.current) {
        iframeRef.current.style.height = e.data.height + "px";
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <iframe
      ref={iframeRef}
      src={\`https://app.laudica.com/embed/\${wallId}\`}
      width="100%"
      height="500"
      frameBorder="0"
      style={{ border: "none", maxWidth: "100%" }}
      loading="lazy"
      className={className}
    />
  );
}`}</code>
              </pre>
            </section>

            {/* Tips */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                Tips
              </h2>
              <ul className="list-disc space-y-3 pl-5">
                <li>
                  <span className="font-medium text-foreground">
                    Dynamic wall IDs
                  </span>{" "}
                  — pass different wall IDs as props to show different walls on
                  different pages.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Next.js / SSR
                  </span>{" "}
                  — the iframe renders on the server as an empty frame and
                  hydrates on the client. No special SSR handling needed.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Domain allowlisting
                  </span>{" "}
                  — add{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground">
                    localhost
                  </code>{" "}
                  to your allowed domains during development.
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run dev`
Open: `http://localhost:3000/integrations/react`
Expected: Tutorial page with 4 steps and tips section.

- [ ] **Step 3: Commit**

```bash
git add src/app/integrations/react/page.tsx
git commit -m "feat: add React integration tutorial page"
```

---

### Task 4: Create the WordPress tutorial page

**Files:**
- Create: `src/app/integrations/wordpress/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "WordPress Integration",
  description:
    "Embed Laudica testimonial walls in your WordPress site. Step-by-step guide for Block Editor and Classic Editor.",
};

const codeBlockClass =
  "overflow-x-auto rounded-lg bg-[#0d0d12] p-4 font-mono text-sm leading-relaxed text-muted-foreground";

export default function WordPressIntegrationPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <Link
            href="/integrations"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            All Integrations
          </Link>

          <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            WordPress
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Add a Laudica testimonial wall to your WordPress site in under a
            minute — no plugins required.
          </p>

          <div className="mt-12 space-y-12 text-base leading-relaxed text-muted-foreground">
            {/* Step 1 */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                1. Copy your embed code
              </h2>
              <p>
                Open the{" "}
                <span className="font-medium text-foreground">wall builder</span>{" "}
                in your Laudica dashboard. Click the{" "}
                <span className="font-medium text-foreground">Embed Code</span>{" "}
                tab and copy the HTML/JS snippet.
              </p>
            </section>

            {/* Step 2 */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                2. Add a Custom HTML block
              </h2>
              <p className="mb-4">
                In the WordPress{" "}
                <span className="font-medium text-foreground">
                  Block Editor (Gutenberg)
                </span>
                , click the{" "}
                <span className="font-medium text-foreground">+</span> button to
                add a new block. Search for{" "}
                <span className="font-medium text-foreground">Custom HTML</span>{" "}
                and select it.
              </p>
              <p>
                If you&apos;re using the{" "}
                <span className="font-medium text-foreground">
                  Classic Editor
                </span>
                , switch to the{" "}
                <span className="font-medium text-foreground">Text</span> tab in
                the editor toolbar.
              </p>
            </section>

            {/* Step 3 */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                3. Paste the snippet
              </h2>
              <p className="mb-4">
                Paste your Laudica embed code into the Custom HTML block:
              </p>
              <pre className={codeBlockClass}>
                <code>{`<!-- Laudica Testimonial Wall -->
<div id="laudica-embed"></div>
<script
  src="https://cdn.laudica.com/embed.js"
  data-wall-id="YOUR_WALL_ID"
  data-container="#laudica-embed"
  async
></script>`}</code>
              </pre>
            </section>

            {/* Step 4 */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                4. Preview and publish
              </h2>
              <p>
                Click{" "}
                <span className="font-medium text-foreground">Preview</span> to
                see your wall in action. When you&apos;re happy with the
                placement, hit{" "}
                <span className="font-medium text-foreground">Publish</span> or{" "}
                <span className="font-medium text-foreground">Update</span>.
              </p>
            </section>

            {/* Tips */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                Tips
              </h2>
              <ul className="list-disc space-y-3 pl-5">
                <li>
                  <span className="font-medium text-foreground">
                    Widget areas
                  </span>{" "}
                  — you can also add the embed to sidebars, footers, or any
                  widget area using a Custom HTML widget.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Both editors supported
                  </span>{" "}
                  — works with both the Block Editor (Gutenberg) and the Classic
                  Editor.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    No plugin needed
                  </span>{" "}
                  — the embed is a standard HTML snippet. No WordPress plugin
                  installation required.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Script restrictions
                  </span>{" "}
                  — if your hosting blocks inline scripts, use the iframe method
                  instead. See the{" "}
                  <Link
                    href="/integrations/html"
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    HTML guide
                  </Link>{" "}
                  for details.
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run dev`
Open: `http://localhost:3000/integrations/wordpress`
Expected: Tutorial page with 4 steps and tips.

- [ ] **Step 3: Commit**

```bash
git add src/app/integrations/wordpress/page.tsx
git commit -m "feat: add WordPress integration tutorial page"
```

---

### Task 5: Create the Webflow tutorial page

**Files:**
- Create: `src/app/integrations/webflow/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Webflow Integration",
  description:
    "Display Laudica testimonial walls on your Webflow site. Step-by-step guide.",
};

const codeBlockClass =
  "overflow-x-auto rounded-lg bg-[#0d0d12] p-4 font-mono text-sm leading-relaxed text-muted-foreground";

export default function WebflowIntegrationPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-20">
        <div className="mx-auto max-w-3xl px-6">
          <Link
            href="/integrations"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            All Integrations
          </Link>

          <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Webflow
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
            Add a Laudica testimonial wall to your Webflow site using the
            built-in Embed element.
          </p>

          <div className="mt-12 space-y-12 text-base leading-relaxed text-muted-foreground">
            {/* Step 1 */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                1. Copy your embed code
              </h2>
              <p>
                Open the{" "}
                <span className="font-medium text-foreground">wall builder</span>{" "}
                in your Laudica dashboard. Click the{" "}
                <span className="font-medium text-foreground">Embed Code</span>{" "}
                tab and copy the HTML/JS snippet.
              </p>
            </section>

            {/* Step 2 */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                2. Add an Embed element
              </h2>
              <p>
                In the Webflow Designer, open the{" "}
                <span className="font-medium text-foreground">
                  Add Elements
                </span>{" "}
                panel (shortcut:{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground">
                  A
                </code>
                ). Under{" "}
                <span className="font-medium text-foreground">Components</span>,
                drag an{" "}
                <span className="font-medium text-foreground">Embed</span>{" "}
                element onto your page where you want the wall to appear.
              </p>
            </section>

            {/* Step 3 */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                3. Paste the code
              </h2>
              <p className="mb-4">
                The Embed element opens a code editor. Paste your Laudica
                snippet:
              </p>
              <pre className={codeBlockClass}>
                <code>{`<!-- Laudica Testimonial Wall -->
<div id="laudica-embed"></div>
<script
  src="https://cdn.laudica.com/embed.js"
  data-wall-id="YOUR_WALL_ID"
  data-container="#laudica-embed"
  async
></script>`}</code>
              </pre>
              <p className="mt-4">
                Click{" "}
                <span className="font-medium text-foreground">
                  Save &amp; Close
                </span>
                .
              </p>
            </section>

            {/* Step 4 */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                4. Publish
              </h2>
              <p>
                The embed won&apos;t render in the Webflow Designer preview — this
                is normal. Click{" "}
                <span className="font-medium text-foreground">Publish</span> to
                see it live on your site.
              </p>
            </section>

            {/* Tips */}
            <section>
              <h2 className="mb-4 text-2xl font-semibold tracking-tight text-foreground">
                Tips
              </h2>
              <ul className="list-disc space-y-3 pl-5">
                <li>
                  <span className="font-medium text-foreground">
                    Global placement
                  </span>{" "}
                  — to show the wall on every page, add the embed code in{" "}
                  <span className="font-medium text-foreground">
                    Site Settings → Custom Code → Footer Code
                  </span>{" "}
                  instead.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Responsive sizing
                  </span>{" "}
                  — the embed is fully responsive. Set the Embed element to{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground">
                    width: 100%
                  </code>{" "}
                  in the Webflow Style panel for best results.
                </li>
                <li>
                  <span className="font-medium text-foreground">
                    Designer preview
                  </span>{" "}
                  — Webflow doesn&apos;t execute custom scripts in the Designer.
                  You&apos;ll see the wall only after publishing or using the
                  staging URL.
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run dev`
Open: `http://localhost:3000/integrations/webflow`
Expected: Tutorial page with 4 steps and tips.

- [ ] **Step 3: Commit**

```bash
git add src/app/integrations/webflow/page.tsx
git commit -m "feat: add Webflow integration tutorial page"
```

---

## Chunk 2: Navigation Updates

### Task 6: Add Integrations to navbar

**Files:**
- Modify: `src/components/landing/navbar.tsx:10-14`

- [ ] **Step 1: Add the nav link**

In `src/components/landing/navbar.tsx`, add `Integrations` to the `navLinks` array after Pricing:

```tsx
const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Showcase", href: "#showcase" },
  { label: "Pricing", href: "#pricing" },
  { label: "Integrations", href: "/integrations" },
];
```

Note: The existing nav links use `<a>` tags with anchor hrefs. The `/integrations` link is a full route. Since the navbar already renders all items as plain `<a>` elements, this works correctly — clicking it navigates to the new page.

- [ ] **Step 2: Verify**

Run: `npm run dev`
Open: `http://localhost:3000`
Expected: "Integrations" appears in the desktop navbar after Pricing. Clicking it navigates to `/integrations`. Also appears in the mobile hamburger menu.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/navbar.tsx
git commit -m "feat: add Integrations link to landing navbar"
```

---

### Task 7: Add Integrations to footer

**Files:**
- Modify: `src/components/landing/footer.tsx:11-16`

- [ ] **Step 1: Add the footer link**

In `src/components/landing/footer.tsx`, add `Integrations` to the `resourceLinks` array:

```tsx
const resourceLinks = [
  { label: "Documentation", href: "/docs" },
  { label: "API Reference", href: "/docs#embedding" },
  { label: "Integrations", href: "/integrations" },
  { label: "Status", href: "#" },
  { label: "Support", href: "mailto:support@laudica.com" },
];
```

- [ ] **Step 2: Verify**

Scroll to the footer on any page. "Integrations" appears in the Resources column. Clicking it navigates to `/integrations`.

- [ ] **Step 3: Commit**

```bash
git add src/components/landing/footer.tsx
git commit -m "feat: add Integrations link to footer"
```

---

### Task 8: Add cross-link in docs Embedding section

**Files:**
- Modify: `src/app/docs/page.tsx:534-539`

- [ ] **Step 1: Add the cross-link paragraph**

In `src/app/docs/page.tsx`, at the end of the "Embedding Walls" section (just before the closing `</section>` tag at line 539), add:

```tsx
                <p className="leading-relaxed text-muted-foreground">
                  For platform-specific step-by-step guides, see our{" "}
                  <a
                    href="/integrations"
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    Integrations
                  </a>{" "}
                  page.
                </p>
```

Insert this between the "Responsive behavior" paragraph (ending around line 538) and the `</section>` tag (line 539).

- [ ] **Step 2: Verify**

Open: `http://localhost:3000/docs`
Scroll to or click the "Embedding Walls" section. The new paragraph appears at the bottom of the section. The link navigates to `/integrations`.

- [ ] **Step 3: Commit**

```bash
git add src/app/docs/page.tsx
git commit -m "feat: add integrations cross-link to docs embedding section"
```

---

### Task 9: Final verification

- [ ] **Step 1: Verify all pages render without errors**

Run: `npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Test all navigation paths**

Run: `npm run dev`

Check each flow:
1. Landing page → Integrations navbar link → `/integrations` grid
2. Grid → each platform card → tutorial page → "All Integrations" back link → grid
3. Footer → Integrations link → `/integrations`
4. Docs → Embedding section → Integrations link → `/integrations`

- [ ] **Step 3: Commit everything and push**

```bash
git push
```
