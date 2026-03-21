"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProject } from "@/hooks/use-project";
import { usePlan } from "@/hooks/use-plan";
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";
import { useRouter } from "next/navigation";
import { toggleWallActive, deleteWall } from "../actions";
import { EmbedShowcase } from "@/app/embed/[id]/embed-showcase";
import { defaultWallConfig, type WallConfig, type WallStyle } from "@/lib/wall-config";
import { getThemeVars } from "@/lib/showcase-helpers";
import { toShowcaseTestimonial, type DbTestimonial } from "@/lib/transform-testimonials";
import { type Testimonial } from "@/data/sample-testimonials";
import {
  Plus,
  Layers,
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
  excluded_ids: string[] | null;
  config: Record<string, unknown> | null;
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
  orbit: "Orbit",
};

const PREVIEW_DISPLAY_HEIGHT = 180;
const PREVIEW_RENDER_HEIGHT = 450;
const PREVIEW_SCALE = PREVIEW_DISPLAY_HEIGHT / PREVIEW_RENDER_HEIGHT;

// Styles that look better at a narrower render width
const NARROW_PREVIEW_STYLES = new Set(["masonry", "minimal-list"]);

export default function WallsPage() {
  const { project } = useProject();
  const { limits } = usePlan();
  const router = useRouter();
  const [walls, setWalls] = useState<Wall[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!project) return;
    const supabase = createClient();

    const [wallsRes, testimonialsRes] = await Promise.all([
      supabase
        .from("walls")
        .select("id, name, style, is_active, tag_filter, max_testimonials, excluded_ids, config, created_at")
        .eq("project_id", project.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("testimonials")
        .select("id, author_name, author_title, author_company, author_photo, text, rating, status, source, created_at, tags:testimonial_tags(tag:tags(id, name, color))")
        .eq("project_id", project.id)
        .in("status", ["approved", "featured"])
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    setWalls((wallsRes.data ?? []) as Wall[]);

    // Transform testimonials for showcase components
    if (testimonialsRes.data) {
      const transformed = testimonialsRes.data.map((t: any) => {
        const tags = (t.tags ?? [])
          .map((jt: any) => jt.tag)
          .filter(Boolean);
        return toShowcaseTestimonial({ ...t, tags } as DbTestimonial);
      });
      setTestimonials(transformed);
    }

    setLoading(false);
  }, [project]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function getWallTestimonials(wall: Wall): Testimonial[] {
    let filtered = [...testimonials];

    // Apply tag filter
    if (wall.tag_filter && wall.tag_filter.length > 0) {
      filtered = filtered.filter((t) =>
        t.tags.some((tag) => wall.tag_filter!.includes(tag))
      );
    }

    // Exclude individual testimonials
    if (wall.excluded_ids && wall.excluded_ids.length > 0) {
      filtered = filtered.filter((t) => !wall.excluded_ids!.includes(t.id));
    }

    // Apply max testimonials
    if (wall.max_testimonials) {
      filtered = filtered.slice(0, wall.max_testimonials);
    }

    return filtered.slice(0, 6); // Cap at 6 for mini preview
  }

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
            <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
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
          {walls.map((wall) => {
            const wallConfig: WallConfig = {
              ...defaultWallConfig,
              ...(wall.config as Partial<WallConfig>),
              showBranding: false,
            };
            const wallTestimonials = getWallTestimonials(wall);

            const isLight = wallConfig.theme === "light";
            const isCustom = wallConfig.theme === "custom";
            const isTransparent = wallConfig.theme === "transparent";
            const colorOverrides = (isCustom || isTransparent) && wallConfig.cardColor
              ? { bgColor: isCustom ? (wallConfig.bgColor || undefined) : undefined, cardColor: wallConfig.cardColor }
              : isCustom && wallConfig.bgColor
                ? { bgColor: wallConfig.bgColor }
                : undefined;
            const themeVars = getThemeVars(wallConfig.theme, colorOverrides);

            const bgValue = isTransparent
              ? "transparent"
              : isCustom && wallConfig.bgColor
                ? wallConfig.bgColor
                : "var(--background)";

            return (
              <div
                key={wall.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/30"
              >
                {/* Header: name, style, status, actions */}
                <div className="flex items-center justify-between p-4 pb-3">
                  <div>
                    <h3 className="text-sm font-medium">{wall.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {styleLabels[wall.style] ?? wall.style}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
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
                          {wall.tag_filter.length}
                        </span>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger className="relative z-10 flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-muted hover:text-foreground group-hover:opacity-100">
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
                </div>

                {/* Mini preview with exact theme */}
                <div
                  className={`relative overflow-hidden border-t border-border ${isLight ? "light" : ""}`}
                  style={{
                    height: PREVIEW_DISPLAY_HEIGHT,
                    ...themeVars,
                    background: wallConfig.bgFade && !isTransparent
                      ? `linear-gradient(to bottom, transparent, ${bgValue} 40%, ${bgValue} 60%, transparent)`
                      : isTransparent
                        ? "repeating-conic-gradient(#2a2a2e 0% 25%, #1a1a1e 0% 50%) 0 0 / 16px 16px"
                        : bgValue,
                  }}
                >
                  {wallTestimonials.length > 0 ? (
                    <div
                      className={`pointer-events-none flex items-center ${isLight ? "light" : ""}`}
                      style={{
                        width: NARROW_PREVIEW_STYLES.has(wall.style)
                          ? `${70 / PREVIEW_SCALE}%`
                          : `${100 / PREVIEW_SCALE}%`,
                        height: PREVIEW_RENDER_HEIGHT,
                        transform: `scale(${PREVIEW_SCALE})`,
                        transformOrigin: "top left",
                        marginLeft: NARROW_PREVIEW_STYLES.has(wall.style)
                          ? `${(100 - 70) / 2}%`
                          : undefined,
                        ...themeVars,
                        background: wallConfig.bgFade
                          ? "transparent"
                          : isCustom && wallConfig.bgColor
                            ? wallConfig.bgColor
                            : isTransparent
                              ? "transparent"
                              : "var(--background)",
                      }}
                    >
                      <div className="w-full">
                        <EmbedShowcase
                          style={wall.style as WallStyle}
                          config={wallConfig}
                          testimonials={wallTestimonials}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      No testimonials to preview
                    </div>
                  )}
                  {/* Fade out at bottom */}
                  {!wallConfig.bgFade && (
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-8"
                      style={{ background: `linear-gradient(to top, ${bgValue}, transparent)` }}
                    />
                  )}
                </div>

                {/* Clickable overlay */}
                <button
                  onClick={() => router.push(`/dashboard/walls/${wall.id}`)}
                  className="absolute inset-0 rounded-xl"
                  aria-label={`Edit ${wall.name}`}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
