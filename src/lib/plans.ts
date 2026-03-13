import type { Database } from "@/lib/supabase/types";

type Plan = Database["public"]["Enums"]["plan"];

export interface PlanLimits {
  maxTestimonials: number;   // -1 = unlimited
  maxWalls: number;
  maxForms: number;
  maxTeamSeats: number;
  canRemoveBranding: boolean;
  canCustomizeColors: boolean;
  hasAnalytics: boolean;
  hasWhiteLabel: boolean;
  hasCustomFormDomain: boolean;
  hasApiAccess: boolean;
  hasExport: boolean;
}

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    maxTestimonials: 15,
    maxWalls: 3,
    maxForms: 1,
    maxTeamSeats: 1,
    canRemoveBranding: false,
    canCustomizeColors: false,
    hasAnalytics: false,
    hasWhiteLabel: false,
    hasCustomFormDomain: false,
    hasApiAccess: false,
    hasExport: false,
  },
  pro: {
    maxTestimonials: -1,
    maxWalls: -1,
    maxForms: -1,
    maxTeamSeats: 3,
    canRemoveBranding: true,
    canCustomizeColors: true,
    hasAnalytics: true,
    hasWhiteLabel: false,
    hasCustomFormDomain: false,
    hasApiAccess: false,
    hasExport: false,
  },
  business: {
    maxTestimonials: -1,
    maxWalls: -1,
    maxForms: -1,
    maxTeamSeats: -1,
    canRemoveBranding: true,
    canCustomizeColors: true,
    hasAnalytics: true,
    hasWhiteLabel: true,
    hasCustomFormDomain: true,
    hasApiAccess: true,
    hasExport: true,
  },
};

export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan];
}

/** Check if a count-based limit is exceeded. Returns true if allowed. */
export function withinLimit(limit: number, currentCount: number): boolean {
  if (limit === -1) return true; // unlimited
  return currentCount < limit;
}

/** Human-readable plan name */
export function planDisplayName(plan: Plan): string {
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}
