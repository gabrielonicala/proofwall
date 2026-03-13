"use client";

import { ArrowUpRight } from "lucide-react";

interface UpgradeBannerProps {
  message: string;
  targetPlan?: "Pro" | "Business";
}

export function UpgradeBanner({
  message,
  targetPlan = "Pro",
}: UpgradeBannerProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
      <p className="flex-1 text-sm text-muted-foreground">{message}</p>
      <a
        href="/dashboard/settings?tab=billing"
        className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-gradient-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Upgrade to {targetPlan}
        <ArrowUpRight className="size-3" />
      </a>
    </div>
  );
}
