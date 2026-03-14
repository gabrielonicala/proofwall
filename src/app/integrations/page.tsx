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
          <h1 className="text-center font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Integrations
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-center text-lg leading-relaxed text-muted-foreground">
            Add Laudica testimonial walls to any platform.
            <br />
            Pick yours for a step-by-step guide.
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
