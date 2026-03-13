"use client";

import { useMemo } from "react";
import { useProject } from "@/hooks/use-project";
import { getPlanLimits, type PlanLimits } from "@/lib/plans";
import type { Database } from "@/lib/supabase/types";

type Plan = Database["public"]["Enums"]["plan"];

interface UsePlanReturn {
  plan: Plan;
  limits: PlanLimits;
  loading: boolean;
}

export function usePlan(): UsePlanReturn {
  const { project, loading } = useProject();

  const plan: Plan = project?.plan ?? "free";
  const limits = useMemo(() => getPlanLimits(plan), [plan]);

  return { plan, limits, loading };
}
