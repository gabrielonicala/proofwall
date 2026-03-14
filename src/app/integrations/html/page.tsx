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
