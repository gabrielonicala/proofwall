"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { ChevronDown } from "lucide-react";

const sections = [
  { id: "getting-started", label: "Getting Started" },
  { id: "collecting", label: "Collecting Testimonials" },
  { id: "managing", label: "Managing Testimonials" },
  { id: "walls", label: "Creating Walls" },
  { id: "embedding", label: "Embedding Walls" },
  { id: "api", label: "API Access" },
  { id: "analytics", label: "Analytics" },
];

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("getting-started");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the entry that is most visible
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];

    elements.forEach((el) => observerRef.current?.observe(el));

    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setMobileNavOpen(false);
    }
  }, []);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-20">
        <div className="container-wide">
          {/* Page header */}
          <div className="mb-12">
            <h1 className="font-display text-4xl tracking-tight text-foreground sm:text-5xl">
              Documentation
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
              Everything you need to collect, manage, and deploy social proof
              with Laudica.
            </p>
          </div>

          {/* Mobile section selector */}
          <div className="relative mb-8 md:hidden">
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="flex w-full items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium text-foreground"
            >
              {sections.find((s) => s.id === activeSection)?.label}
              <ChevronDown
                className={`size-4 text-muted-foreground transition-transform ${
                  mobileNavOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {mobileNavOpen && (
              <div className="absolute inset-x-0 top-full z-30 mt-1 rounded-lg border border-border bg-card shadow-lg">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollTo(section.id)}
                    className={`block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted ${
                      activeSection === section.id
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-12 lg:gap-16">
            {/* Sidebar */}
            <aside className="hidden md:block">
              <nav className="sticky top-24 w-52 shrink-0 space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => scrollTo(section.id)}
                    className={`block w-full rounded-r-md border-l-2 px-4 py-2 text-left text-sm transition-all ${
                      activeSection === section.id
                        ? "border-primary bg-primary/5 font-medium text-foreground"
                        : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>
            </aside>

            {/* Content */}
            <div className="min-w-0 max-w-3xl flex-1 space-y-16">
              {/* ---- Getting Started ---- */}
              <section id="getting-started" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">
                  Getting Started
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  Laudica helps you collect social proof from customers and
                  deploy it across your website to increase conversions. Here is
                  how to get up and running in a few minutes.
                </p>

                <h3 className="text-lg font-medium text-foreground">
                  Create your account
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  Sign up for free with your email or Google account. No credit
                  card required. You will land on your dashboard immediately
                  after signup.
                </p>

                <h3 className="text-lg font-medium text-foreground">
                  Create a project
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  A project is your workspace. All testimonials, walls,
                  collection forms, and analytics live inside a single project.
                  Most teams only need one project, but you can create
                  additional ones if you manage multiple brands.
                </p>

                <h3 className="text-lg font-medium text-foreground">
                  Dashboard overview
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  The dashboard gives you a birds-eye view of your social proof:
                  total testimonials, active walls, embed views, and recent
                  activity. From here you can navigate to testimonials, walls,
                  forms, import tools, analytics, and settings.
                </p>
              </section>

              {/* ---- Collecting Testimonials ---- */}
              <section id="collecting" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">
                  Collecting Testimonials
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  Laudica gives you four ways to get testimonials into your
                  project. Use whichever works best for your workflow, or
                  combine them.
                </p>

                <h3 className="text-lg font-medium text-foreground">
                  Collection Forms
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  Create branded collection forms with your logo, custom
                  heading, and a thank-you message. Each form gets a unique
                  shareable link you can send to customers, include in email
                  sequences, or embed on your site. Submitted testimonials
                  appear in your dashboard as pending for review.
                </p>

                <h3 className="text-lg font-medium text-foreground">
                  Manual Entry
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  Add testimonials directly from the dashboard. Enter the
                  customer&apos;s name, company, role, avatar, star rating, and
                  their quote. This is useful for testimonials you already have
                  from emails, calls, or chat conversations.
                </p>

                <h3 className="text-lg font-medium text-foreground">
                  Paste-to-Import
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  Paste a tweet URL or any block of text and Laudica will
                  parse it into a testimonial. For tweets, it automatically
                  extracts the author, handle, avatar, and content. For plain
                  text, you can assign the author details after import.
                </p>

                <h3 className="text-lg font-medium text-foreground">
                  CSV Upload
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  Bulk import testimonials from a spreadsheet. Upload a CSV file
                  and map your columns to Laudica fields (name, company, role,
                  content, rating, etc.). This is the fastest way to migrate
                  from another tool or import a large backlog.
                </p>
              </section>

              {/* ---- Managing Testimonials ---- */}
              <section id="managing" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">
                  Managing Testimonials
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  Once testimonials are in your project, use the management
                  tools to organize and curate them.
                </p>

                <h3 className="text-lg font-medium text-foreground">
                  Status workflow
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  Every testimonial has a status that controls its visibility:
                </p>
                <ul className="ml-1 list-inside list-disc space-y-2 text-muted-foreground">
                  <li>
                    <span className="font-medium text-foreground">
                      Pending
                    </span>{" "}
                    &mdash; New testimonials from collection forms start here.
                    They are not visible in any walls until you review them.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Approved
                    </span>{" "}
                    &mdash; Testimonials you have reviewed and accepted. These
                    are eligible to appear in walls.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Featured
                    </span>{" "}
                    &mdash; Your best testimonials. Use this status to highlight
                    top social proof and filter for it in walls.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Archived
                    </span>{" "}
                    &mdash; Hidden from walls but not deleted. Archive outdated
                    or irrelevant testimonials to keep your library clean.
                  </li>
                </ul>

                <h3 className="text-lg font-medium text-foreground">Tags</h3>
                <p className="leading-relaxed text-muted-foreground">
                  Tags let you categorize testimonials by context. Common tags
                  include Pricing, Trust, Results, Features, Onboarding, and
                  Support. You can create custom tags. Tags are especially
                  powerful when combined with wall filtering &mdash; display
                  only testimonials tagged &ldquo;Pricing&rdquo; next to your
                  pricing section, or &ldquo;Results&rdquo; on your case
                  studies page.
                </p>

                <h3 className="text-lg font-medium text-foreground">
                  Filtering and search
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  Filter your testimonial library by status, tags, star rating,
                  or source. Use the search bar to find specific testimonials by
                  customer name, company, or content keywords.
                </p>
              </section>

              {/* ---- Creating Walls ---- */}
              <section id="walls" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">
                  Creating Walls
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  A wall is a configured display of your testimonials. Each wall
                  has a showcase style, visual settings, and filtering rules
                  that determine which testimonials appear and how they look.
                </p>

                <h3 className="text-lg font-medium text-foreground">
                  Showcase styles
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  Laudica offers 9 showcase styles. Each one is designed for a
                  different use case and layout:
                </p>
                <ul className="ml-1 list-inside list-disc space-y-2 text-muted-foreground">
                  <li>
                    <span className="font-medium text-foreground">
                      Cards Grid
                    </span>{" "}
                    &mdash; A responsive grid of testimonial cards. Great for
                    dedicated testimonial pages.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Carousel
                    </span>{" "}
                    &mdash; Swipeable horizontal carousel with auto-play. Ideal
                    for hero sections and landing pages.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Ticker Tape
                    </span>{" "}
                    &mdash; Continuously scrolling horizontal strip. Perfect for
                    social proof bars above or below navigation.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Fade Rotator
                    </span>{" "}
                    &mdash; One testimonial at a time, fading between them.
                    Minimal footprint for sidebars and modals.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Minimal List
                    </span>{" "}
                    &mdash; Clean vertical list with subtle dividers. Good for
                    text-heavy testimonials.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Masonry
                    </span>{" "}
                    &mdash; Pinterest-style staggered layout that adapts to
                    varying testimonial lengths.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Marquee
                    </span>{" "}
                    &mdash; Vertical auto-scrolling column. Works well in narrow
                    sidebars and tall sections.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Spotlight Stack
                    </span>{" "}
                    &mdash; Stacked cards with a featured testimonial on top.
                    Emphasizes your best social proof.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Orbit</span>{" "}
                    &mdash; Animated circular layout with testimonials orbiting
                    a central element. Eye-catching and unique.
                  </li>
                </ul>

                <h3 className="text-lg font-medium text-foreground">
                  Configuration options
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  Every wall can be customized with these settings:
                </p>
                <ul className="ml-1 list-inside list-disc space-y-2 text-muted-foreground">
                  <li>
                    <span className="font-medium text-foreground">Theme</span>{" "}
                    &mdash; Dark, light, or auto (inherits from the embedding
                    page).
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Colors</span>{" "}
                    &mdash; Primary color, card background, and text colors.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">Fonts</span>{" "}
                    &mdash; Choose from a set of web-safe and Google Fonts.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Card style
                    </span>{" "}
                    &mdash; Bordered, filled, or glass (frosted background).
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Border radius
                    </span>{" "}
                    &mdash; From sharp corners to fully rounded.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Animation speed
                    </span>{" "}
                    &mdash; Control scroll, rotation, and transition speeds.
                  </li>
                  <li>
                    <span className="font-medium text-foreground">
                      Show/hide elements
                    </span>{" "}
                    &mdash; Toggle star ratings, avatars, company names, dates,
                    and source icons.
                  </li>
                </ul>

                <h3 className="text-lg font-medium text-foreground">
                  Tag filtering
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  Filter which testimonials appear in each wall by selecting one
                  or more tags. This lets you create context-specific walls
                  &mdash; a wall showing only &ldquo;Pricing&rdquo;-tagged
                  testimonials on your pricing page, another with
                  &ldquo;Features&rdquo;-tagged ones on your features page.
                </p>

                <h3 className="text-lg font-medium text-foreground">
                  Live preview
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  The wall builder includes a live preview that updates in real
                  time as you change settings. What you see is exactly what your
                  visitors will see when the wall is embedded.
                </p>
              </section>

              {/* ---- Embedding Walls ---- */}
              <section id="embedding" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">
                  Embedding Walls
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  Once your wall is configured, embed it on any website using
                  one of four methods.
                </p>

                <h3 className="text-lg font-medium text-foreground">
                  HTML / JavaScript snippet
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  Drop a small script tag into your page. The snippet loads
                  asynchronously and renders the wall inside a container div.
                </p>
                <pre className="overflow-x-auto rounded-lg bg-[#0d0d12] p-4 font-mono text-sm leading-relaxed text-muted-foreground">
                  <code>{`<!-- Laudica Embed -->
<div id="laudica-embed"></div>
<script
  src="https://cdn.laudica.com/embed.js"
  data-wall-id="YOUR_WALL_ID"
  data-container="#laudica-embed"
  async
></script>`}</code>
                </pre>

                <h3 className="text-lg font-medium text-foreground">iFrame</h3>
                <p className="leading-relaxed text-muted-foreground">
                  If you cannot add JavaScript to your site (e.g., some CMS
                  platforms), use an iframe embed. The wall is fully
                  self-contained.
                </p>
                <pre className="overflow-x-auto rounded-lg bg-[#0d0d12] p-4 font-mono text-sm leading-relaxed text-muted-foreground">
                  <code>{`<iframe
  src="https://app.laudica.com/embed/YOUR_WALL_ID"
  width="100%"
  height="500"
  frameborder="0"
  style="border: none; max-width: 100%;"
  loading="lazy"
></iframe>`}</code>
                </pre>

                <h3 className="text-lg font-medium text-foreground">
                  React component
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  For React and Next.js projects, create a reusable component
                  that wraps the Laudica embed iframe. See the{" "}
                  <a
                    href="/integrations/react"
                    className="text-primary underline underline-offset-4 hover:text-primary/80"
                  >
                    React integration guide
                  </a>{" "}
                  for a full walkthrough with auto-resize support.
                </p>
                <pre className="overflow-x-auto rounded-lg bg-[#0d0d12] p-4 font-mono text-sm leading-relaxed text-muted-foreground">
                  <code>{`export function LaudicaWall({ wallId }: { wallId: string }) {
  return (
    <iframe
      src={\`https://app.laudica.com/embed/\${wallId}\`}
      width="100%"
      height="500"
      frameBorder="0"
      style={{ border: "none", maxWidth: "100%" }}
      loading="lazy"
    />
  );
}`}</code>
                </pre>

                <h3 className="text-lg font-medium text-foreground">
                  Preview link
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  Every wall has a standalone preview URL you can share with
                  your team for review, or link to directly.
                </p>
                <pre className="overflow-x-auto rounded-lg bg-[#0d0d12] p-4 font-mono text-sm leading-relaxed text-muted-foreground">
                  <code>{`https://app.laudica.com/embed/YOUR_WALL_ID`}</code>
                </pre>

                <h3 className="text-lg font-medium text-foreground">
                  Domain restrictions
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  Lock your wall embeds to specific domains so they only render
                  on your authorized websites. Add one or more allowed domains
                  in the wall settings. Requests from unauthorized domains will
                  be rejected.
                </p>

                <h3 className="text-lg font-medium text-foreground">
                  Responsive behavior
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  All embeds are fully responsive. They automatically resize to
                  fit their container and adapt their layout for mobile, tablet,
                  and desktop viewports. No additional configuration needed.
                </p>

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
              </section>

              {/* ---- API Access ---- */}
              <section id="api" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">
                  API Access
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  Business plan users can access testimonials programmatically via
                  a REST API. This is useful for custom integrations, mobile apps,
                  or server-side rendering.
                </p>

                <h3 className="text-lg font-medium text-foreground">
                  GET /api/v1/testimonials
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  Retrieve testimonials for a project. Supports filtering and
                  pagination.
                </p>

                <h3 className="text-lg font-medium text-foreground">
                  Query parameters
                </h3>
                <ul className="ml-1 list-inside list-disc space-y-2 text-muted-foreground">
                  <li>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
                      projectId
                    </code>{" "}
                    (required) &mdash; Your project ID.
                  </li>
                  <li>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
                      status
                    </code>{" "}
                    &mdash; Filter by status: pending, approved, featured, or
                    archived.
                  </li>
                  <li>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
                      limit
                    </code>{" "}
                    &mdash; Maximum results per request, up to 100 (default: 50).
                  </li>
                  <li>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
                      offset
                    </code>{" "}
                    &mdash; Pagination offset (default: 0).
                  </li>
                </ul>

                <h3 className="text-lg font-medium text-foreground">
                  Response format
                </h3>
                <pre className="overflow-x-auto rounded-lg bg-[#0d0d12] p-4 font-mono text-sm leading-relaxed text-muted-foreground">
                  <code>{`{
  "data": [
    {
      "id": "...",
      "author_name": "Jane Doe",
      "text": "Great product!",
      "rating": 5,
      "status": "approved",
      ...
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "count": 12
  }
}`}</code>
                </pre>

                <h3 className="text-lg font-medium text-foreground">
                  Authentication
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  Requests require an active session (cookie-based
                  authentication). The API is available on the Business plan only.
                  Users on Free or Pro plans will receive a 403 response.
                </p>
              </section>

              {/* ---- Analytics ---- */}
              <section id="analytics" className="scroll-mt-24 space-y-6">
                <h2 className="text-2xl font-semibold text-foreground">
                  Analytics
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  Laudica tracks how your testimonials perform so you can
                  measure the impact of your social proof.
                </p>

                <h3 className="text-lg font-medium text-foreground">
                  View tracking
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  Every time an embedded wall loads on a visitor&apos;s screen,
                  it counts as a view. Views are tracked automatically with no
                  setup required. You can see view counts per wall and across
                  your entire project.
                </p>

                <h3 className="text-lg font-medium text-foreground">
                  Time periods
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  View analytics by different time ranges: today, last 7 days,
                  last 30 days, or all time. Spot trends to understand which
                  walls and placements drive the most engagement.
                </p>

                <h3 className="text-lg font-medium text-foreground">
                  Source breakdown
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  See where your testimonials come from at a glance. The source
                  breakdown shows the distribution across collection forms,
                  manual entries, paste imports, and CSV uploads.
                </p>

                <h3 className="text-lg font-medium text-foreground">
                  Privacy-friendly
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  Laudica analytics are privacy-friendly by design. No cookies
                  are set on embed viewers, no personal data is collected, and
                  no third-party trackers are used. View counts are simple
                  server-side increments &mdash; compliant with GDPR and similar
                  regulations out of the box.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
