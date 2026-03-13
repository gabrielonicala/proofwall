"use client";

import { useEffect, useState } from "react";
import { useProject } from "@/hooks/use-project";
import { createClient } from "@/lib/supabase/client";

interface UsageStats {
  testimonials: number;
  walls: number;
  forms: number;
  seats: number;
}

interface UseUsageStatsReturn {
  stats: UsageStats;
  loading: boolean;
}

export function useUsageStats(): UseUsageStatsReturn {
  const { project } = useProject();
  const [stats, setStats] = useState<UsageStats>({
    testimonials: 0,
    walls: 0,
    forms: 0,
    seats: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!project) return;

    async function fetchCounts() {
      const supabase = createClient();

      const [testimonials, walls, forms, seats] = await Promise.all([
        supabase
          .from("testimonials")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project!.id),
        supabase
          .from("walls")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project!.id),
        supabase
          .from("collection_forms")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project!.id),
        supabase
          .from("project_members")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project!.id),
      ]);

      setStats({
        testimonials: testimonials.count ?? 0,
        walls: walls.count ?? 0,
        forms: forms.count ?? 0,
        seats: seats.count ?? 0,
      });
      setLoading(false);
    }

    fetchCounts();
  }, [project]);

  return { stats, loading };
}
