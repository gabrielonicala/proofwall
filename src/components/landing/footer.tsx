import { Shield } from "lucide-react";
import Link from "next/link";

const footerLinks = [
  { label: "Features", href: "#features" },
  { label: "Showcase", href: "#showcase" },
  { label: "Pricing", href: "#pricing" },
];

export function Footer() {
  return (
    <footer className="border-t border-border/50 py-10 sm:py-12">
      <div className="container-wide">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-primary">
              <Shield className="size-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-bold text-foreground">
              Proof<span className="text-gradient">Wall</span>
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {footerLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ProofWall. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
