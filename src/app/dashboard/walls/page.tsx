"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProject } from "@/hooks/use-project";
import { usePlan } from "@/hooks/use-plan";
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";
import { useRouter } from "next/navigation";
import { toggleWallActive, deleteWall } from "../actions";
import {
  Plus,
  Layers,
  Eye,
  Tag,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Trash2,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Wall = {
  id: string;
  name: string;
  style: string;
  is_active: boolean;
  tag_filter: string[] | null;
  max_testimonials: number | null;
  created_at: string;
};

const styleLabels: Record<string, string> = {
  "cards-grid": "Cards Grid",
  carousel: "Carousel",
  "ticker-tape": "Ticker Tape",
  "fade-rotator": "Fade Rotator",
  "minimal-list": "Minimal List",
  masonry: "Masonry",
  marquee: "Marquee",
  "spotlight-stack": "Spotlight Stack",
};

const styleIcons: Record<string, string> = {
  "cards-grid": "▦",
  carousel: "◐",
  "ticker-tape": "↔",
  "fade-rotator": "◉",
  "minimal-list": "≡",
  masonry: "▧",
  marquee: "↕",
  "spotlight-stack": "◈",
};

export default function WallsPage() {
  const { project } = useProject();
  const { limits } = usePlan();
  const router = useRouter();
  const [walls, setWalls] = useState<Wall[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWalls = useCallback(async () => {
    if (!project) return;
    const supabase = createClient();
    const { data } = await supabase
      .from("walls")
      .select("id, name, style, is_active, tag_filter, max_testimonials, created_at")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false });
    setWalls(data ?? []);
    setLoading(false);
  }, [project]);

  useEffect(() => {
    fetchWalls();
  }, [fetchWalls]);

  async function handleToggleActive(id: string, current: boolean) {
    if (!project) return;
    const result = await toggleWallActive(project.id, id, !current);
    if (result.error) return;
    setWalls((prev) =>
      prev.map((w) => (w.id === id ? { ...w, is_active: !current } : w))
    );
  }

  async function handleDelete(id: string) {
    if (!project) return;
    const result = await deleteWall(project.id, id);
    if (result.error) return;
    setWalls((prev) => prev.filter((w) => w.id !== id));
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Upgrade banner */}
      {limits.maxWalls !== -1 && walls.length >= limits.maxWalls && (
        <UpgradeBanner message="You've reached your wall limit." />
      )}

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Walls</h1>
          <p className="text-sm text-muted-foreground">
            {walls.length}{limits.maxWalls !== -1 ? ` / ${limits.maxWalls}` : ""} wall{walls.length !== 1 ? "s" : ""} ·{" "}
            {walls.filter((w) => w.is_active).length} active
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/walls/new")}
          className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          Create Wall
        </button>
      </div>

      {/* Walls grid */}
      {walls.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <Layers className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="text-muted-foreground">
            No walls yet. Create your first one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {walls.map((wall) => (
            <div
              key={wall.id}
              className="group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/30"
            >
              {/* Top row */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-lg">
                    {styleIcons[wall.style] ?? "▦"}
                  </span>
                  <div>
                    <h3 className="text-sm font-medium">{wall.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {styleLabels[wall.style] ?? wall.style}
                    </p>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100">
                    <MoreVertical className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => router.push(`/dashboard/walls/${wall.id}`)}>
                      <Pencil className="mr-2 size-3.5" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleActive(wall.id, wall.is_active)}>
                      {wall.is_active ? (
                        <>
                          <ToggleLeft className="mr-2 size-3.5" /> Deactivate
                        </>
                      ) : (
                        <>
                          <ToggleRight className="mr-2 size-3.5" /> Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(wall.id)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 size-3.5" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Meta */}
              <div className="mt-auto flex items-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  {wall.is_active ? (
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                  ) : (
                    <span className="size-1.5 rounded-full bg-muted-foreground" />
                  )}
                  {wall.is_active ? "Active" : "Inactive"}
                </span>
                {wall.tag_filter && wall.tag_filter.length > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Tag className="size-3" />
                    {wall.tag_filter.length} tag{wall.tag_filter.length !== 1 ? "s" : ""}
                  </span>
                )}
                {wall.max_testimonials && (
                  <span>Max {wall.max_testimonials}</span>
                )}
              </div>

              {/* Clickable overlay */}
              <button
                onClick={() => router.push(`/dashboard/walls/${wall.id}`)}
                className="absolute inset-0 rounded-xl"
                aria-label={`Edit ${wall.name}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
