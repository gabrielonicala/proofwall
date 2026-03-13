"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProject } from "@/hooks/use-project";
import type { Tables, Enums } from "@/lib/supabase/types";
import { usePlan } from "@/hooks/use-plan";
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";
import {
  BarChart3,
  Eye,
  MessageSquare,
  TrendingUp,
  Star,
  CheckCircle2,
  FileText,
  Clock,
} from "lucide-react";

type Testimonial = Tables<"testimonials">;
type TestimonialSource = Enums<"testimonial_source">;
type TestimonialStatus = Enums<"testimonial_status">;
type WallStyle = Enums<"wall_style">;

interface OverviewStats {
  totalTestimonials: number;
  approvedTestimonials: number;
  totalWallViews: number;
  formSubmissions: number;
}

interface WallWithViews {
  id: string;
  name: string;
  style: WallStyle;
  is_active: boolean;
  views: number;
}

interface SourceCount {
  source: TestimonialSource;
  count: number;
}

const SOURCE_LABELS: Record<TestimonialSource, string> = {
  manual: "Manual",
  form: "Form",
  csv: "CSV Import",
  url: "URL",
  twitter: "Twitter",
};

const SOURCE_COLORS: Record<TestimonialSource, string> = {
  manual: "bg-blue-500",
  form: "bg-emerald-500",
  csv: "bg-amber-500",
  url: "bg-purple-500",
  twitter: "bg-sky-500",
};

const STATUS_STYLES: Record<
  TestimonialStatus,
  { bg: string; text: string; label: string }
> = {
  pending: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-500",
    label: "Pending",
  },
  approved: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    label: "Approved",
  },
  featured: {
    bg: "bg-primary/10",
    text: "text-primary",
    label: "Featured",
  },
  archived: {
    bg: "bg-gray-500/10",
    text: "text-gray-500",
    label: "Archived",
  },
};

const WALL_STYLE_LABELS: Record<WallStyle, string> = {
  "cards-grid": "Cards Grid",
  carousel: "Carousel",
  "ticker-tape": "Ticker Tape",
  "fade-rotator": "Fade Rotator",
  "minimal-list": "Minimal List",
  masonry: "Masonry",
  marquee: "Marquee",
  "spotlight-stack": "Spotlight Stack",
};

export default function AnalyticsPage() {
  const { project, loading: projectLoading } = useProject();
  const { limits } = usePlan();
  const [overview, setOverview] = useState<OverviewStats>({
    totalTestimonials: 0,
    approvedTestimonials: 0,
    totalWallViews: 0,
    formSubmissions: 0,
  });
  const [walls, setWalls] = useState<WallWithViews[]>([]);
  const [recentTestimonials, setRecentTestimonials] = useState<Testimonial[]>(
    []
  );
  const [sourceCounts, setSourceCounts] = useState<SourceCount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!project) return;
    const supabase = createClient();
    setLoading(true);

    try {
      // ---- Overview stats ----
      const [totalRes, approvedRes, formRes, wallViewsRes] = await Promise.all([
        supabase
          .from("testimonials")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project.id),
        supabase
          .from("testimonials")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project.id)
          .eq("status", "approved"),
        supabase
          .from("testimonials")
          .select("*", { count: "exact", head: true })
          .eq("project_id", project.id)
          .eq("source", "form"),
        supabase
          .from("walls")
          .select("id")
          .eq("project_id", project.id),
      ]);

      // Get total wall views across all walls in this project
      let totalWallViews = 0;
      const projectWallIds = (wallViewsRes.data ?? []).map((w) => w.id);

      if (projectWallIds.length > 0) {
        const { count } = await supabase
          .from("wall_views")
          .select("*", { count: "exact", head: true })
          .in("wall_id", projectWallIds);
        totalWallViews = count ?? 0;
      }

      setOverview({
        totalTestimonials: totalRes.count ?? 0,
        approvedTestimonials: approvedRes.count ?? 0,
        totalWallViews,
        formSubmissions: formRes.count ?? 0,
      });

      // ---- Wall performance ----
      const { data: wallsData } = await supabase
        .from("walls")
        .select("id, name, style, is_active")
        .eq("project_id", project.id);

      if (wallsData && wallsData.length > 0) {
        const wallIds = wallsData.map((w) => w.id);
        const { data: viewsData } = await supabase
          .from("wall_views")
          .select("wall_id")
          .in("wall_id", wallIds);

        // Count views per wall
        const viewCountMap: Record<string, number> = {};
        for (const v of viewsData ?? []) {
          viewCountMap[v.wall_id] = (viewCountMap[v.wall_id] ?? 0) + 1;
        }

        const wallsWithViews: WallWithViews[] = wallsData
          .map((w) => ({
            id: w.id,
            name: w.name,
            style: w.style,
            is_active: w.is_active,
            views: viewCountMap[w.id] ?? 0,
          }))
          .sort((a, b) => b.views - a.views);

        setWalls(wallsWithViews);
      } else {
        setWalls([]);
      }

      // ---- Recent testimonials ----
      const { data: recentData } = await supabase
        .from("testimonials")
        .select("*")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setRecentTestimonials(recentData ?? []);

      // ---- Source breakdown ----
      const { data: allTestimonials } = await supabase
        .from("testimonials")
        .select("source")
        .eq("project_id", project.id);

      const sourceMap: Record<string, number> = {};
      for (const t of allTestimonials ?? []) {
        sourceMap[t.source] = (sourceMap[t.source] ?? 0) + 1;
      }

      const sources: SourceCount[] = (
        Object.keys(SOURCE_LABELS) as TestimonialSource[]
      )
        .map((source) => ({
          source,
          count: sourceMap[source] ?? 0,
        }))
        .sort((a, b) => b.count - a.count);

      setSourceCounts(sources);
    } finally {
      setLoading(false);
    }
  }, [project]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (projectLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
          <div className="h-64 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  const overviewCards = [
    {
      label: "Total Testimonials",
      value: overview.totalTestimonials,
      icon: MessageSquare,
    },
    {
      label: "Approved",
      value: overview.approvedTestimonials,
      icon: CheckCircle2,
    },
    {
      label: "Total Wall Views",
      value: overview.totalWallViews,
      icon: Eye,
    },
    {
      label: "Form Submissions",
      value: overview.formSubmissions,
      icon: FileText,
    },
  ];

  const maxSourceCount = Math.max(...sourceCounts.map((s) => s.count), 1);
  const totalSourceCount = sourceCounts.reduce((sum, s) => sum + s.count, 0);

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function renderStars(rating: number | null) {
    if (rating === null) return <span className="text-muted-foreground">-</span>;
    return (
      <span className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`size-3.5 ${
              i < rating
                ? "fill-amber-400 text-amber-400"
                : "text-muted-foreground/30"
            }`}
          />
        ))}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="size-6 text-primary" />
        <h1 className="text-2xl font-bold">Analytics</h1>
      </div>

      {!limits.hasAnalytics && (
        <UpgradeBanner message="Detailed analytics are available on the Pro plan." />
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-border bg-card p-5"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {card.label}
              </span>
              <card.icon className="size-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Wall Performance + Sources Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Wall Performance Table */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="size-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Wall Performance</h2>
          </div>
          {walls.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No walls created yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-2 pr-4 font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="pb-2 pr-4 font-medium text-muted-foreground">
                      Style
                    </th>
                    <th className="pb-2 pr-4 text-right font-medium text-muted-foreground">
                      Views
                    </th>
                    <th className="pb-2 text-right font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {walls.map((wall) => (
                    <tr
                      key={wall.id}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-2.5 pr-4 font-medium">{wall.name}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {WALL_STYLE_LABELS[wall.style]}
                      </td>
                      <td className="py-2.5 pr-4 text-right tabular-nums">
                        {wall.views.toLocaleString()}
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                            wall.is_active
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-gray-500/10 text-gray-500"
                          }`}
                        >
                          {wall.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Testimonial Sources Breakdown */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="size-4 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Sources Breakdown</h2>
          </div>
          {totalSourceCount === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No testimonials yet.
            </p>
          ) : (
            <div className="space-y-3">
              {sourceCounts.map((item) => (
                <div key={item.source} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {SOURCE_LABELS[item.source]}
                    </span>
                    <span className="tabular-nums text-muted-foreground">
                      {item.count}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${SOURCE_COLORS[item.source]}`}
                      style={{
                        width: `${(item.count / maxSourceCount) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Recent Activity</h2>
        </div>
        {recentTestimonials.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No testimonials received yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">
                    Author
                  </th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">
                    Rating
                  </th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">
                    Source
                  </th>
                  <th className="pb-2 pr-4 font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="pb-2 text-right font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentTestimonials.map((t) => {
                  const statusStyle = STATUS_STYLES[t.status];
                  return (
                    <tr
                      key={t.id}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-2.5 pr-4 font-medium">
                        {t.author_name}
                      </td>
                      <td className="py-2.5 pr-4">{renderStars(t.rating)}</td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {SOURCE_LABELS[t.source]}
                      </td>
                      <td className="py-2.5 pr-4 text-muted-foreground">
                        {formatDate(t.created_at)}
                      </td>
                      <td className="py-2.5 text-right">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                        >
                          {statusStyle.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
