import { LogoIcon } from "@/components/logo";
import Link from "next/link";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "Showcase Styles", href: "#showcase" },
  { label: "Pricing", href: "#pricing" },
];

const resourceLinks = [
  { label: "Documentation", href: "/docs" },
  { label: "API Reference", href: "/docs#embedding" },
  { label: "Integrations", href: "/integrations" },
  { label: "Support", href: "mailto:support@laudica.com" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/50 pt-12 pb-8 sm:pt-16">
      <div className="container-wide">
        {/* Main footer grid */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-9 md:gap-12">
          {/* Brand column */}
          <div className="col-span-2 sm:col-span-3">
            <Link href="/" className="mb-1 inline-flex items-center gap-2">
              <LogoIcon className="size-8" />
              <span className="font-display text-[2.25rem] leading-none tracking-tight text-foreground">
                <span className="text-gradient-logo">Laudica</span>
              </span>
            </Link>
            <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-muted-foreground">
              The social proof engine for modern SaaS.
              <br />
              Collect, organize, and deploy testimonials that convert.
            </p>
          </div>

          {/* Product links */}
          <div className="sm:col-span-2">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Product
            </h4>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resource links */}
          <div className="sm:col-span-2">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Resources
            </h4>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div className="sm:col-span-2">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Legal
            </h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border/30 pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Laudica. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="mailto:support@laudica.com"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              support@laudica.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
