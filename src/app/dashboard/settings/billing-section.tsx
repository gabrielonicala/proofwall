"use client";

import Link from "next/link";
import { usePlan } from "@/hooks/use-plan";
import { planDisplayName } from "@/lib/plans";
import { ChevronRight } from "lucide-react";

export function BillingSection() {
  const { plan, loading } = usePlan();

  if (loading) {
    return (
      <div className="flex items-center justify-between py-1">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="h-5 w-24 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold">Billing & Plan</h2>
        <p className="text-sm text-muted-foreground">
          Current plan: <span className="font-medium text-foreground">{planDisplayName(plan)}</span>
        </p>
      </div>
      <Link
        href="/dashboard/billing"
        className="inline-flex items-center gap-1 text-sm text-primary transition-colors hover:text-primary/80"
      >
        Manage billing
        <ChevronRight className="size-4" />
      </Link>
    </div>
  );
}
