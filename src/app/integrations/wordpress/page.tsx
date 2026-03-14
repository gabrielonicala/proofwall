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
