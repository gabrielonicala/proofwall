import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import { JsonLd, breadcrumbSchema } from "@/components/json-ld";
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
      <JsonLd data={breadcrumbSchema([
        { name: "Home", href: "/" },
        { name: "Integrations", href: "/integrations" },
        { name: "React" },
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
                Create a reusable component that wraps the Laudica iframe. It
                listens for{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono text-foreground">
                  laudica-resize
                </code>{" "}
                events so the iframe automatically matches its content height:
              </p>
              <pre className={codeBlockClass}>
                <code>{`import { useEffect, useRef } from "react";

interface LaudicaWallProps {
  wallId: string;
  className?: string;
}

export function LaudicaWall({ wallId, className }: LaudicaWallProps) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e.data?.type === "laudica-resize" && ref.current) {
        ref.current.style.height = e.data.height + "px";
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  return (
    <iframe
      ref={ref}
      src={\`https://app.laudica.com/embed/\${wallId}\`}
      style={{ width: "100%", border: "none", minHeight: 100, margin: "2rem 0" }}
      scrolling="no"
      loading="lazy"
      title="Laudica testimonials"
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
