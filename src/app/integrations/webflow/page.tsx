import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { JsonLd, breadcrumbSchema } from "@/components/json-ld";
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
      <JsonLd data={breadcrumbSchema([
        { name: "Home", href: "/" },
        { name: "Integrations", href: "/integrations" },
        { name: "Webflow" },
      ])} />
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
