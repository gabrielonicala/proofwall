"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useProject } from "@/hooks/use-project";
import { AddTestimonialDialog } from "@/components/dashboard/add-testimonial-dialog";
import { TestimonialCard } from "@/components/dashboard/testimonial-card";
import {
  updateTestimonialStatus,
  deleteTestimonial,
  toggleTestimonialTag,
} from "../actions";
import { usePlan } from "@/hooks/use-plan";
import { UpgradeBanner } from "@/components/dashboard/upgrade-banner";
import {
  Search,
  Plus,
  Grid3X3,
  List,
} from "lucide-react";

type Testimonial = {
  id: string;
  author_name: string;
  author_title: string | null;
  author_company: string | null;
  author_photo: string | null;
  text: string;
  rating: number | null;
  status: "pending" | "approved" | "featured" | "archived";
  source: string;
  created_at: string;
  tags: { id: string; name: string; color: string }[];
};

type Tag = { id: string; name: string; color: string };

const STATUS_OPTIONS = ["all", "pending", "approved", "featured", "archived"] as const;

export default function TestimonialsPage() {
  const { project } = useProject();
  const { limits } = usePlan();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!project) return;
    const supabase = createClient();

    // Fetch testimonials
    const { data: testimonialRows } = await supabase
      .from("testimonials")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false });

    // Fetch tags
    const { data: tagRows } = await supabase
      .from("tags")
      .select("*")
      .eq("project_id", project.id);

    // Fetch testimonial-tag relationships
    const { data: tagLinks } = await supabase
      .from("testimonial_tags")
      .select("testimonial_id, tag_id");

    const tagMap = new Map<string, Tag>();
    (tagRows ?? []).forEach((t) => tagMap.set(t.id, t));

    const testimonialTags = new Map<string, Tag[]>();
    (tagLinks ?? []).forEach((link) => {
      const tag = tagMap.get(link.tag_id);
      if (tag) {
        const existing = testimonialTags.get(link.testimonial_id) ?? [];
        existing.push(tag);
        testimonialTags.set(link.testimonial_id, existing);
      }
    });

    setTestimonials(
      (testimonialRows ?? []).map((t) => ({
        ...t,
        tags: testimonialTags.get(t.id) ?? [],
      }))
    );
    setTags(tagRows ?? []);
    setLoading(false);
  }, [project]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleStatusChange(id: string, status: Testimonial["status"]) {
    if (!project) return;
    const result = await updateTestimonialStatus(project.id, id, status);
    if (result.error) return;
    setTestimonials((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  }

  async function handleDelete(id: string) {
    if (!project) return;
    const result = await deleteTestimonial(project.id, id);
    if (result.error) return;
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleTagToggle(testimonialId: string, tagId: string) {
    if (!project) return;
    const testimonial = testimonials.find((t) => t.id === testimonialId);
    if (!testimonial) return;

    const hasTag = testimonial.tags.some((t) => t.id === tagId);
    const result = await toggleTestimonialTag(
      project.id,
      testimonialId,
      tagId,
      hasTag ? "remove" : "add"
    );
    if (result.error) return;

    // Update local state
    const tag = tags.find((t) => t.id === tagId);
    if (!tag) return;
    setTestimonials((prev) =>
      prev.map((t) => {
        if (t.id !== testimonialId) return t;
        return {
          ...t,
          tags: hasTag
            ? t.tags.filter((tg) => tg.id !== tagId)
            : [...t.tags, tag],
        };
      })
    );
  }

  // Filter
  const filtered = testimonials.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        t.author_name.toLowerCase().includes(q) ||
        t.text.toLowerCase().includes(q) ||
        (t.author_company ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const editingTestimonial = editingId
    ? testimonials.find((t) => t.id === editingId) ?? null
    : null;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Upgrade banner */}
      {limits.maxTestimonials !== -1 && testimonials.length >= limits.maxTestimonials && (
        <UpgradeBanner message="You've reached your testimonial limit." />
      )}

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Testimonials</h1>
          <p className="text-sm text-muted-foreground">
            {testimonials.length}{limits.maxTestimonials !== -1 ? ` / ${limits.maxTestimonials}` : ""} total · {testimonials.filter((t) => t.status === "pending").length} pending
          </p>
        </div>
        <div className="flex items-center gap-2">
          {limits.hasExport && project && (
            <div className="flex gap-2">
              <a
                href={`/api/export?projectId=${project.id}&format=csv`}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
              >
                Export CSV
              </a>
              <a
                href={`/api/export?projectId=${project.id}&format=json`}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
              >
                Export JSON
              </a>
            </div>
          )}
          <button
            onClick={() => {
              setEditingId(null);
              setDialogOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Plus className="size-4" />
            Add Testimonial
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search testimonials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
          />
        </div>

        {/* Status filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s === "all" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>

        {/* View toggle */}
        <div className="flex rounded-lg border border-border">
          <button
            onClick={() => setViewMode("grid")}
            className={`rounded-l-lg px-2.5 py-2 ${viewMode === "grid" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
          >
            <Grid3X3 className="size-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`rounded-r-lg px-2.5 py-2 ${viewMode === "list" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
          >
            <List className="size-4" />
          </button>
        </div>
      </div>

      {/* Testimonials */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">
            {testimonials.length === 0
              ? "No testimonials yet. Add your first one!"
              : "No testimonials match your filters."}
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2"
              : "space-y-3"
          }
        >
          {filtered.map((t) => (
            <TestimonialCard
              key={t.id}
              testimonial={t}
              tags={tags}
              viewMode={viewMode}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onTagToggle={handleTagToggle}
              onEdit={() => {
                setEditingId(t.id);
                setDialogOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Dialog */}
      <AddTestimonialDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        editing={editingTestimonial}
        onSaved={() => {
          setDialogOpen(false);
          setEditingId(null);
          fetchData();
        }}
      />
    </div>
  );
}
