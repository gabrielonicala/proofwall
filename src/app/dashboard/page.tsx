"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProject } from "@/hooks/use-project";
import { useRouter } from "next/navigation";
import {
  MessageSquareQuote,
  Eye,
  Layers,
  Clock,
  Plus,
  FileText,
  ArrowRight,
  Star,
  CheckCircle2,
  XCircle,
  Sparkles,
} from "lucide-react";

interface Stats {
  totalTestimonials: number;
  wallViews: number;
  activeWalls: number;
  pendingApproval: number;
}

interface PendingItem {
  id: string;
  author_name: string;
  text: string;
  rating: number | null;
  source: string;
  created_at: string;
}

export default function DashboardPage() {
  const { project, loading: projectLoading } = useProject();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalTestimonials: 0,
    wallViews: 0,
    activeWalls: 0,
    pendingApproval: 0,
  });
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!project) return;
    const supabase = createClient();

    const [totalRes, pendingRes, wallsRes, pendingRows] = await Promise.all([
      supabase
        .from("testimonials")
        .select("*", { count: "exact", head: true })
        .eq("project_id", project.id),
      supabase
        .from("testimonials")
        .select("*", { count: "exact", head: true })
        .eq("project_id", project.id)
        .eq("status", "pending"),
      supabase
        .from("walls")
        .select("*", { count: "exact", head: true })
        .eq("project_id", project.id)
        .eq("is_active", true),
      supabase
        .from("testimonials")
        .select("id, author_name, text, rating, source, created_at")
        .eq("project_id", project.id)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    setStats({
      totalTestimonials: totalRes.count ?? 0,
      wallViews: 0, // TODO: aggregate from wall_views
      activeWalls: wallsRes.count ?? 0,
      pendingApproval: pendingRes.count ?? 0,
    });
    setPending(pendingRows.data ?? []);
    setLoading(false);
  }, [project]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleApprove(id: string) {
    const supabase = createClient();
    await supabase.from("testimonials").update({ status: "approved" }).eq("id", id);
    setPending((prev) => prev.filter((p) => p.id !== id));
    setStats((prev) => ({
      ...prev,
      pendingApproval: prev.pendingApproval - 1,
      totalTestimonials: prev.totalTestimonials,
    }));
  }

  async function handleReject(id: string) {
    const supabase = createClient();
    await supabase.from("testimonials").update({ status: "archived" }).eq("id", id);
    setPending((prev) => prev.filter((p) => p.id !== id));
    setStats((prev) => ({
      ...prev,
      pendingApproval: prev.pendingApproval - 1,
    }));
  }

  if (projectLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  const statCards = [
    { label: "Total Testimonials", value: stats.totalTestimonials, icon: MessageSquareQuote },
    { label: "Wall Views", value: stats.wallViews, icon: Eye },
    { label: "Active Walls", value: stats.activeWalls, icon: Layers },
    { label: "Pending Approval", value: stats.pendingApproval, icon: Clock, highlight: stats.pendingApproval > 0 },
  ];

  const quickActions = [
    { label: "Add Testimonial", icon: Plus, href: "/dashboard/testimonials" },
    { label: "Create Wall", icon: Layers, href: "/dashboard/walls/new" },
    { label: "Create Form", icon: FileText, href: "/dashboard/forms/new" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border p-5 ${
              s.highlight
                ? "border-amber-500/30 bg-amber-500/5"
                : "border-border bg-card"
            }`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <s.icon className={`size-4 ${s.highlight ? "text-amber-500" : "text-muted-foreground"}`} />
            </div>
            <p className="text-3xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {quickActions.map((action) => (
          <button
            key={action.label}
            onClick={() => router.push(action.href)}
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/30 hover:bg-primary/5"
          >
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <action.icon className="size-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{action.label}</p>
            </div>
            <ArrowRight className="size-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      {/* Pending approval */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-amber-500" />
            <h2 className="text-lg font-semibold">Needs Your Attention</h2>
            {stats.pendingApproval > 0 && (
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-500">
                {stats.pendingApproval}
              </span>
            )}
          </div>
          {stats.pendingApproval > 5 && (
            <button
              onClick={() => router.push("/dashboard/testimonials")}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              View all
            </button>
          )}
        </div>

        {pending.length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto mb-2 size-8 text-emerald-500/50" />
            <p className="text-sm text-muted-foreground">
              All caught up! No testimonials waiting for review.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-4 rounded-lg border border-border p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <p className="text-sm font-medium">{item.author_name}</p>
                    {item.rating && (
                      <span className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`size-3 ${
                              i < item.rating!
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                      </span>
                    )}
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {item.source}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {item.text}
                  </p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 transition-colors hover:bg-emerald-500/20"
                    title="Approve"
                  >
                    <CheckCircle2 className="size-4" />
                  </button>
                  <button
                    onClick={() => handleReject(item.id)}
                    className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20"
                    title="Reject"
                  >
                    <XCircle className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
