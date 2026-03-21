"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useProject } from "@/hooks/use-project";
import { usePlan } from "@/hooks/use-plan";
import {
  type WallStyle,
  type WallConfig,
  defaultWallConfig,
  styleLabels,
  styleDescriptions,
  allStyles,
  animatedStyles,
  cardBasedStyles,
  ratingStyles,
  photoStyles,
} from "@/lib/wall-config";
import { type DbTestimonial, toShowcaseTestimonial } from "@/lib/transform-testimonials";
import { getThemeVars } from "@/lib/showcase-helpers";
import { CardsGrid } from "@/components/showcase/cards-grid";
import { Carousel } from "@/components/showcase/carousel";
import { TickerTape } from "@/components/showcase/ticker-tape";
import { FadeRotator } from "@/components/showcase/fade-rotator";
import { MinimalList } from "@/components/showcase/minimal-list";
import { MasonryGrid } from "@/components/showcase/masonry-grid";
import { VerticalMarquee } from "@/components/showcase/vertical-marquee";
import { SpotlightStack } from "@/components/showcase/spotlight-stack";
import { Orbit } from "@/components/showcase/orbit";
import {
  ArrowLeft,
  Save,
  Loader2,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  EyeOff,
  Copy,
  Check,
  Info,
  Code,
  Globe,
  ExternalLink,
  SlidersHorizontal,
  X,
  Pencil,
  Users,
  Star,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

type Tag = { id: string; name: string; color: string };

export default function WallEditorPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { project } = useProject();
  const { limits } = usePlan();
  const isNew = params.id === "new";

  // Wall state
  const [name, setName] = useState("My Wall");
  const [style, setStyle] = useState<WallStyle>("cards-grid");
  const [config, setConfig] = useState<WallConfig>(defaultWallConfig);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [maxTestimonials, setMaxTestimonials] = useState<number | null>(null);
  const [excludedIds, setExcludedIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  // Data
  const [testimonials, setTestimonials] = useState<DbTestimonial[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Preview
  const [previewWidth, setPreviewWidth] = useState<"full" | "tablet" | "mobile">("full");
  const [configOpen, setConfigOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);

  // Fetch wall data + testimonials + tags
  const fetchData = useCallback(async () => {
    if (!project) return;
    const supabase = createClient();

    // Fetch testimonials with tags
    const { data: testimonialRows } = await supabase
      .from("testimonials")
      .select("*")
      .eq("project_id", project.id)
      .in("status", ["approved", "featured"])
      .order("created_at", { ascending: false });

    const { data: tagRows } = await supabase
      .from("tags")
      .select("*")
      .eq("project_id", project.id);

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

    // If editing, fetch wall data
    if (!isNew) {
      const { data: wall } = await supabase
        .from("walls")
        .select("*")
        .eq("id", params.id)
        .single();

      if (wall) {
        setName(wall.name);
        setStyle(wall.style as WallStyle);
        setConfig({ ...defaultWallConfig, ...(wall.config as Partial<WallConfig>) });
        setTagFilter(wall.tag_filter ?? []);
        setMaxTestimonials(wall.max_testimonials);
        setExcludedIds(wall.excluded_ids ?? []);
        setIsActive(wall.is_active);
      }
    }

    setLoading(false);
  }, [project, isNew, params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && configOpen) setConfigOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [configOpen]);

  // Filter + sort testimonials for preview
  const previewTestimonials = useMemo(() => {
    let filtered = [...testimonials];

    // Tag filter
    if (tagFilter.length > 0) {
      filtered = filtered.filter((t) =>
        t.tags.some((tag) => tagFilter.includes(tag.id))
      );
    }

    // Photo filter
    if (config.onlyWithPhotos) {
      filtered = filtered.filter((t) => !!t.author_photo);
    }

    // Exclude individual testimonials
    if (excludedIds.length > 0) {
      filtered = filtered.filter((t) => !excludedIds.includes(t.id));
    }

    // Sort
    if (config.sort === "highest") {
      filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (config.sort === "random") {
      // Fisher-Yates shuffle for uniform distribution
      for (let i = filtered.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
      }
    }
    // "newest" is default from DB order

    // Max
    if (maxTestimonials && maxTestimonials > 0) {
      filtered = filtered.slice(0, maxTestimonials);
    }

    return filtered.map(toShowcaseTestimonial);
  }, [testimonials, tagFilter, config.sort, config.onlyWithPhotos, excludedIds, maxTestimonials]);

  // Testimonials matching filters but before exclusion (for manage dialog)
  const filteredForManage = useMemo(() => {
    let filtered = [...testimonials];
    if (tagFilter.length > 0) {
      filtered = filtered.filter((t) =>
        t.tags.some((tag) => tagFilter.includes(tag.id))
      );
    }
    if (config.onlyWithPhotos) {
      filtered = filtered.filter((t) => !!t.author_photo);
    }
    return filtered;
  }, [testimonials, tagFilter, config.onlyWithPhotos]);

  const excludeCount = useMemo(() => {
    const matchingExcluded = filteredForManage.filter((t) =>
      excludedIds.includes(t.id)
    ).length;
    return {
      included: filteredForManage.length - matchingExcluded,
      excluded: matchingExcluded,
    };
  }, [filteredForManage, excludedIds]);

  function toggleExclude(id: string) {
    setExcludedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function bulkToggleExclude() {
    const allExcluded = filteredForManage.every((t) => excludedIds.includes(t.id));
    if (allExcluded) {
      const filteredIds = new Set(filteredForManage.map((t) => t.id));
      setExcludedIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      const currentSet = new Set(excludedIds);
      const newIds = filteredForManage.map((t) => t.id).filter((id) => !currentSet.has(id));
      setExcludedIds((prev) => [...prev, ...newIds]);
    }
  }

  // Save wall
  async function handleSave() {
    if (!project || !name.trim()) return;
    setSaving(true);
    const supabase = createClient();

    const payload = {
      name: name.trim(),
      style: style as string,
      config: JSON.parse(JSON.stringify(config)),
      tag_filter: tagFilter.length > 0 ? tagFilter : null,
      max_testimonials: maxTestimonials,
      excluded_ids: excludedIds.length > 0 ? excludedIds : null,
      is_active: isActive,
      project_id: project.id,
    };

    if (isNew) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- style may include values not yet in DB enum
      const { data } = await supabase.from("walls").insert(payload as any).select("id").single();
      setSaving(false);
      if (data) {
        router.replace(`/dashboard/walls/${data.id}`);
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await supabase.from("walls").update(payload as any).eq("id", params.id);
      setSaving(false);
    }
  }

  function updateConfig<K extends keyof WallConfig>(key: K, value: WallConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  // Render showcase component based on style
  function renderPreview() {
    if (previewTestimonials.length === 0) {
      return (
        <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
          No testimonials match your filters.
          {testimonials.length === 0 && " Add some approved testimonials first."}
        </div>
      );
    }

    const props = { testimonials: previewTestimonials, config };
    const animProps = {
      ...props,
      speed: config.speed as "slow" | "normal" | "fast",
      autoplay: config.autoplay,
      pauseOnHover: config.pauseOnHover,
    };

    switch (style) {
      case "cards-grid":
        return <CardsGrid {...props} />;
      case "carousel":
        return <Carousel {...animProps} />;
      case "ticker-tape":
        return <TickerTape {...animProps} />;
      case "fade-rotator":
        return <FadeRotator {...animProps} />;
      case "minimal-list":
        return <MinimalList {...props} />;
      case "masonry":
        return <MasonryGrid {...props} />;
      case "marquee":
        return <VerticalMarquee {...animProps} />;
      case "spotlight-stack":
        return <SpotlightStack {...props} />;
      case "orbit":
        return <Orbit {...animProps} />;
      default:
        return null;
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  const previewWidthClass =
    previewWidth === "tablet"
      ? "max-w-[768px]"
      : previewWidth === "mobile"
        ? "max-w-[375px]"
        : "";

  const configContent = (
    <div className="space-y-6">
      {/* Style selector */}
      <Section title="Display Style">
        <div className="grid grid-cols-2 gap-2">
          {allStyles.map((s) => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              className={`rounded-lg border p-2.5 text-left text-xs transition-all ${
                style === s
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
              }`}
            >
              <p className="font-medium">{styleLabels[s]}</p>
            </button>
          ))}
        </div>
      </Section>

      {/* Tag filter */}
      {tags.length > 0 && (
        <Section title="Tag Filter">
          <p className="mb-2 text-xs text-muted-foreground">
            Only show testimonials with these tags
          </p>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => {
              const active = tagFilter.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  onClick={() =>
                    setTagFilter((prev) =>
                      active
                        ? prev.filter((id) => id !== tag.id)
                        : [...prev, tag.id]
                    )
                  }
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs transition-colors ${
                    active
                      ? "font-medium"
                      : "opacity-50 hover:opacity-80"
                  }`}
                  style={{
                    backgroundColor: tag.color + (active ? "30" : "15"),
                    color: tag.color,
                  }}
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                </button>
              );
            })}
          </div>
          {tagFilter.length > 0 && (
            <button
              onClick={() => setTagFilter([])}
              className="mt-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear filters
            </button>
          )}
        </Section>
      )}

      {/* Manage testimonials */}
      <Section title="Testimonials">
        <div className="mb-2 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            {excludeCount.included} included
          </span>
          {excludeCount.excluded > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              <span className="size-1.5 rounded-full bg-muted-foreground" />
              {excludeCount.excluded} excluded
            </span>
          )}
        </div>
        <Dialog open={manageOpen} onOpenChange={setManageOpen}>
          <DialogTrigger className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Users className="size-3.5" />
            Manage&hellip;
          </DialogTrigger>
          <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
            {/* Header */}
            <div className="border-b border-border px-5 pb-4 pt-5">
              <DialogTitle className="text-base font-semibold">Manage Testimonials</DialogTitle>
              <DialogDescription className="mt-1 text-xs">
                {filteredForManage.length} testimonial{filteredForManage.length !== 1 ? "s" : ""} match your current filters
              </DialogDescription>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between border-b border-border/50 bg-muted/30 px-5 py-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                  {excludeCount.included} visible
                </span>
                {excludeCount.excluded > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-medium text-destructive">
                    {excludeCount.excluded} hidden
                  </span>
                )}
              </div>
              <button
                onClick={bulkToggleExclude}
                className="rounded-md px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {filteredForManage.every((t) => excludedIds.includes(t.id))
                  ? "Include all"
                  : "Exclude all"}
              </button>
            </div>

            {/* List */}
            <div className="max-h-[60vh] overflow-y-auto px-2 py-2">
              {filteredForManage.map((t) => {
                const isExcluded = excludedIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    onClick={() => toggleExclude(t.id)}
                    className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all ${
                      isExcluded
                        ? "opacity-45 hover:opacity-70"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      {t.author_photo ? (
                        <img
                          src={t.author_photo}
                          alt={t.author_name}
                          className={`size-9 rounded-full object-cover ring-2 transition-all ${
                            isExcluded
                              ? "ring-muted grayscale"
                              : "ring-emerald-500/30"
                          }`}
                        />
                      ) : (
                        <div className={`flex size-9 items-center justify-center rounded-full text-xs font-semibold ring-2 transition-all ${
                          isExcluded
                            ? "bg-muted text-muted-foreground ring-muted"
                            : "bg-primary/15 text-primary ring-primary/30"
                        }`}>
                          {t.author_name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`truncate text-sm font-medium ${
                          isExcluded ? "text-muted-foreground line-through" : "text-foreground"
                        }`}>
                          {t.author_name}
                        </p>
                        {(t.rating ?? 0) > 0 && (
                          <div className="hidden flex-shrink-0 gap-0.5 sm:flex">
                            {Array.from({ length: t.rating ?? 0 }).map((_, i) => (
                              <Star
                                key={i}
                                className="size-2.5 fill-accent text-accent"
                              />
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {t.text}
                      </p>
                    </div>

                    {/* Toggle indicator */}
                    <div className={`flex size-7 flex-shrink-0 items-center justify-center rounded-full transition-all ${
                      isExcluded
                        ? "bg-destructive/15 text-destructive"
                        : "bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500/25"
                    }`}>
                      {isExcluded ? (
                        <EyeOff className="size-3.5" />
                      ) : (
                        <Eye className="size-3.5" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <DialogFooter showCloseButton className="mx-0 mb-0" />
          </DialogContent>
        </Dialog>
      </Section>

      {/* Max testimonials */}
      <Section title="Max Testimonials">
        <input
          type="number"
          min={0}
          value={maxTestimonials ?? ""}
          onChange={(e) =>
            setMaxTestimonials(e.target.value ? Number(e.target.value) : null)
          }
          placeholder="All"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
      </Section>

      {/* Sort */}
      <Section title="Sort Order">
        <select
          value={config.sort}
          onChange={(e) => updateConfig("sort", e.target.value as WallConfig["sort"])}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        >
          <option value="newest">Newest first</option>
          <option value="highest">Highest rated</option>
          <option value="random">Random</option>
        </select>
      </Section>

      {/* Speed / Autoplay (only for animated styles) */}
      {animatedStyles.includes(style) && (
        <Section title="Animation">
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Speed</label>
              <select
                value={config.speed}
                onChange={(e) => updateConfig("speed", e.target.value as WallConfig["speed"])}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
              >
                <option value="slow">Slow</option>
                <option value="normal">Normal</option>
                <option value="fast">Fast</option>
              </select>
            </div>
            <Toggle
              label="Autoplay"
              checked={config.autoplay}
              onChange={(v) => updateConfig("autoplay", v)}
            />
            <Toggle
              label="Pause on hover"
              checked={config.pauseOnHover}
              onChange={(v) => updateConfig("pauseOnHover", v)}
            />
          </div>
        </Section>
      )}

      {/* Show/hide elements */}
      <Section title="Show / Hide">
        <div className="space-y-2.5">
          {ratingStyles.includes(style) && (
            <Toggle
              label="Star rating"
              checked={config.showRating}
              onChange={(v) => updateConfig("showRating", v)}
            />
          )}
          {photoStyles.includes(style) && (
            <>
              <Toggle
                label="Author photo"
                checked={config.showPhoto}
                onChange={(v) => {
                  updateConfig("showPhoto", v);
                  if (!v) updateConfig("onlyWithPhotos", false);
                }}
              />
              {config.showPhoto && (
                <div className="ml-4">
                  <Toggle
                    label="Only with photos"
                    checked={config.onlyWithPhotos}
                    onChange={(v) => updateConfig("onlyWithPhotos", v)}
                  />
                  {config.onlyWithPhotos && (
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Testimonials without a photo will be excluded
                    </p>
                  )}
                </div>
              )}
            </>
          )}
          <Toggle
            label="Company name"
            checked={config.showCompany}
            onChange={(v) => updateConfig("showCompany", v)}
          />
          <Toggle
            label="Date"
            checked={config.showDate}
            onChange={(v) => updateConfig("showDate", v)}
          />
          <Toggle
            label="Laudica branding"
            checked={config.showBranding}
            onChange={(v) => updateConfig("showBranding", v)}
          />
          {style === "cards-grid" && (
            <div>
              <Toggle
                label="Fill rows evenly"
                checked={config.fillRows}
                onChange={(v) => updateConfig("fillRows", v)}
              />
              <p className="mt-1 flex items-start gap-1 text-[10px] leading-relaxed text-muted-foreground">
                <Info className="mt-0.5 size-3 flex-shrink-0" />
                When enabled, testimonials that don&apos;t complete a full row are hidden so every row has the same number of cards. The count adjusts automatically based on screen width.
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* Card style — only for card-based styles */}
      {cardBasedStyles.includes(style) && (
        <Section title="Card Style">
          <select
            value={config.cardStyle}
            onChange={(e) => updateConfig("cardStyle", e.target.value as WallConfig["cardStyle"])}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          >
            <option value="bordered">Bordered</option>
            <option value="shadow">Shadow</option>
            <option value="glass">Glass</option>
            <option value="flat">Flat</option>
          </select>
        </Section>
      )}

      {/* Border customization — only for bordered card style */}
      <AnimatePresence initial={false}>
        {cardBasedStyles.includes(style) && config.cardStyle === "bordered" && (
          <motion.div
            key="border-controls"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center justify-between text-xs text-muted-foreground">
                Border color
                <input
                  type="color"
                  value={config.borderColor || "#2e2e38"}
                  onChange={(e) => updateConfig("borderColor", e.target.value)}
                  className="h-5 w-9 cursor-pointer appearance-none rounded-full border-none bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-none"
                />
              </label>
              <label className="flex items-center justify-between text-xs text-muted-foreground">
                Border thickness
                <div className="flex items-center gap-2">
                  <span className="w-5 text-right tabular-nums text-muted-foreground">{config.borderThickness ?? 1}</span>
                  <input
                    type="range"
                    min={1}
                    max={4}
                    step={1}
                    value={config.borderThickness ?? 1}
                    onChange={(e) => updateConfig("borderThickness", Number(e.target.value))}
                    className="h-1.5 w-20 cursor-pointer appearance-none rounded-full bg-muted accent-primary [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm"
                  />
                </div>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Border radius — only for card-based styles */}
      {cardBasedStyles.includes(style) && (
        <Section title="Border Radius">
          <select
            value={config.borderRadius}
            onChange={(e) => updateConfig("borderRadius", e.target.value as WallConfig["borderRadius"])}
            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
          >
            <option value="none">None</option>
            <option value="subtle">Subtle</option>
            <option value="rounded">Rounded</option>
            <option value="pill">Pill</option>
          </select>
        </Section>
      )}

      {/* Font */}
      <Section title="Font">
        <select
          value={config.font}
          onChange={(e) => updateConfig("font", e.target.value as WallConfig["font"])}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        >
          <option value="system">System</option>
          <option value="inter">Inter</option>
          <option value="serif">Serif</option>
          <option value="mono">Mono</option>
        </select>
      </Section>

      {/* Theme */}
      <Section title="Theme">
        <select
          value={config.theme}
          onChange={(e) => updateConfig("theme", e.target.value as WallConfig["theme"])}
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
          <option value="transparent">Transparent</option>
          <option value="custom">Custom</option>
        </select>

        {/* Custom color pickers */}
        <AnimatePresence initial={false}>
          {(config.theme === "custom" || config.theme === "transparent") && (
            <motion.div
              key="color-pickers"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mt-3 space-y-2">
                <AnimatePresence initial={false}>
                  {config.theme === "custom" && (
                    <motion.div
                      key="bg-color"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <label className="flex cursor-pointer items-center justify-between text-xs text-muted-foreground">
                        Background color
                        <input
                          type="color"
                          value={config.bgColor || "#09090b"}
                          onChange={(e) => updateConfig("bgColor", e.target.value)}
                          className="h-5 w-9 cursor-pointer appearance-none rounded-full border-none bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-none"
                        />
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>
                <label className={`flex items-center justify-between text-xs ${config.cardStyle === "glass" || !cardBasedStyles.includes(style) ? "text-muted-foreground/40" : "cursor-pointer text-muted-foreground"}`}>
                  Card color
                  <input
                    type="color"
                    value={config.cardColor || "#1a1a1f"}
                    onChange={(e) => updateConfig("cardColor", e.target.value)}
                    disabled={config.cardStyle === "glass" || !cardBasedStyles.includes(style)}
                    className={`h-5 w-9 appearance-none rounded-full border-none bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0.5 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-none [&::-moz-color-swatch]:rounded-full [&::-moz-color-swatch]:border-none ${config.cardStyle === "glass" || !cardBasedStyles.includes(style) ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
                  />
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fade edges — not for transparent */}
        <AnimatePresence initial={false}>
          {config.theme !== "transparent" && (
            <motion.label
              key="fade-toggle"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="mt-3 flex cursor-pointer items-center justify-between overflow-hidden text-xs text-muted-foreground"
            >
              Fade edges into host background
              <button
                type="button"
                role="switch"
                aria-checked={config.bgFade ?? false}
                onClick={() => updateConfig("bgFade", !(config.bgFade ?? false))}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  config.bgFade ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`inline-block size-3.5 rounded-full bg-white transition-transform ${
                    config.bgFade ? "translate-x-[18px]" : "translate-x-[3px]"
                  }`}
                />
              </button>
            </motion.label>
          )}
        </AnimatePresence>

        {/* Embed padding */}
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Embed padding</span>
            <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">{config.embedPadding ?? 4}rem</span>
          </div>
          <div className="relative flex items-center">
            <input
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={config.embedPadding ?? 4}
              onChange={(e) => updateConfig("embedPadding", parseFloat(e.target.value))}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-sm [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125 [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-sm [&::-moz-range-thumb]:transition-transform [&::-moz-range-thumb]:hover:scale-125"
            />
          </div>
        </div>
      </Section>

      {/* Embed code — only for existing walls */}
      {!isNew && (
        <Section title="Embed Code">
          <EmbedCodePanel wallId={params.id} />
          {!limits.hasWhiteLabel && (
            <p className="mt-2 text-xs text-muted-foreground">
              Embeds include Laudica branding.{" "}
              <a href="/dashboard/billing" className="text-primary underline">
                Upgrade to Business
              </a>{" "}
              for white-label embeds.
            </p>
          )}
        </Section>
      )}

      {/* Domain lock */}
      {!isNew && (
        <Section title="Allowed Domains">
          <p className="mb-2 text-xs text-muted-foreground">
            Restrict which websites can embed this wall. Leave empty to allow all.
          </p>
          <DomainList
            domains={config.allowedDomains ?? []}
            onChange={(domains) => updateConfig("allowedDomains", domains)}
          />
        </Section>
      )}

      {/* Active toggle */}
      <Section title="Status">
        <Toggle
          label="Wall is active"
          checked={isActive}
          onChange={setIsActive}
        />
      </Section>
    </div>
  );

  return (
    <div className="flex h-[calc(100svh-3.5rem)] flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/walls")}
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </button>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={15}
            className="hidden min-w-0 max-w-52 rounded-lg bg-muted/50 px-3 py-1 text-lg font-semibold outline-none placeholder:text-muted-foreground focus:bg-muted sm:block"
            placeholder="Wall name..."
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Preview size toggles */}
          <div className="hidden rounded-lg border border-border sm:flex">
            <button
              onClick={() => setPreviewWidth("full")}
              className={`rounded-l-lg px-2 py-1.5 ${previewWidth === "full" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
            >
              <Monitor className="size-3.5" />
            </button>
            <button
              onClick={() => setPreviewWidth("tablet")}
              className={`px-2 py-1.5 ${previewWidth === "tablet" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
            >
              <Tablet className="size-3.5" />
            </button>
            <button
              onClick={() => setPreviewWidth("mobile")}
              className={`rounded-r-lg px-2 py-1.5 ${previewWidth === "mobile" ? "bg-muted text-foreground" : "text-muted-foreground"}`}
            >
              <Smartphone className="size-3.5" />
            </button>
          </div>
          <button
            onClick={() => setConfigOpen(true)}
            className="flex size-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden"
            aria-label="Open settings"
          >
            <SlidersHorizontal className="size-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 sm:px-4"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            <span className="hidden sm:inline">{isNew ? "Create Wall" : "Save"}</span>
          </button>
        </div>
      </div>

      {/* Editor body */}
      {/* Mobile config drawer */}
      <AnimatePresence>
        {configOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm sm:hidden"
            onClick={() => setConfigOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {configOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            role="dialog"
            aria-label="Wall configuration"
            className="fixed inset-y-0 left-0 z-50 w-full overflow-y-auto bg-background p-4 sm:hidden"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Settings</h2>
              <button
                onClick={() => setConfigOpen(false)}
                className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close settings"
              >
                <X className="size-4" />
              </button>
            </div>
            {configContent}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: Config */}
        <div className="hidden w-72 flex-shrink-0 overflow-y-auto border-r border-border p-4 sm:block">
          {configContent}
        </div>

        {/* Right panel: Preview */}
        <div
          className={`min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-6 transition-colors duration-300 ${config.theme === "light" ? "light" : ""}`}
          style={{
            ...getThemeVars(config.theme, (config.theme === "custom" || config.theme === "transparent") ? {
              bgColor: config.theme === "custom" ? (config.bgColor || undefined) : undefined,
              cardColor: config.cardColor || undefined,
            } : undefined),
            background: config.bgFade && config.theme !== "transparent"
              ? "oklch(0.112 0.008 280)"
              : config.theme === "transparent"
                ? "repeating-conic-gradient(#2a2a2e 0% 25%, #1a1a1e 0% 50%) 0 0 / 16px 16px"
                : config.theme === "custom" && config.bgColor
                  ? config.bgColor
                  : "var(--background)",
          }}
        >
          <div className="sticky top-0 z-10 mb-3 flex items-center gap-2 rounded-md bg-black/50 px-2 py-1 text-xs text-muted-foreground backdrop-blur-sm" style={{ width: "fit-content" }}>
            <Eye className="size-3.5" />
            Live Preview · {previewTestimonials.length} testimonial{previewTestimonials.length !== 1 ? "s" : ""}
          </div>
          <div
            style={config.bgFade && config.theme !== "transparent" ? {
              margin: "-1.5rem -1.5rem 0",
              padding: "0 1.5rem",
              background: (() => {
                const solid = config.theme === "custom" && config.bgColor
                  ? config.bgColor
                  : config.theme === "light" ? "oklch(0.985 0.002 280)" : "oklch(0.112 0.008 280)";
                return `linear-gradient(to bottom, transparent, ${solid} 40%, ${solid} 60%, transparent)`;
              })(),
            } : undefined}
          >
            <div
              className={`mx-auto transition-all duration-300 ${previewWidthClass}`}
              style={{ paddingTop: `${config.embedPadding ?? 4}rem`, paddingBottom: `${config.embedPadding ?? 4}rem` }}
            >
              {renderPreview()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Helper components ─── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block size-3.5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-[18px]" : "translate-x-[3px]"
          }`}
        />
      </button>
    </label>
  );
}

function DomainList({
  domains,
  onChange,
}: {
  domains: string[];
  onChange: (domains: string[]) => void;
}) {
  const [input, setInput] = useState("");

  function addDomain() {
    const d = input.trim().toLowerCase();
    if (!d || domains.includes(d)) return;
    onChange([...domains, d]);
    setInput("");
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDomain())}
          placeholder="example.com"
          className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/30"
        />
        <button
          type="button"
          onClick={addDomain}
          className="rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/80"
        >
          Add
        </button>
      </div>
      {domains.length > 0 && (
        <ul className="space-y-1">
          {domains.map((d) => (
            <li
              key={d}
              className="flex items-center justify-between rounded-md bg-muted/50 px-2.5 py-1.5 text-xs"
            >
              <span className="truncate">{d}</span>
              <button
                type="button"
                onClick={() => onChange(domains.filter((x) => x !== d))}
                className="ml-2 flex-shrink-0 text-muted-foreground transition-colors hover:text-destructive"
              >
                &times;
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type EmbedTab = "html" | "iframe" | "react" | "preview";

const embedTabs: { id: EmbedTab; label: string; icon: React.ElementType }[] = [
  { id: "html", label: "HTML/JS", icon: Code },
  { id: "iframe", label: "iFrame", icon: Globe },
  { id: "react", label: "React", icon: Code },
  { id: "preview", label: "Preview", icon: ExternalLink },
];

function highlightHtml(code: string) {
  // Simple syntax highlighter for HTML/JSX snippets
  const parts: { text: string; cls: string }[] = [];
  // Match HTML tags, attributes, strings, and plain text
  const regex = /(<\/?[\w-]+)|(\s[\w-]+)(?==)|("[^"]*")|('(?:[^'\\]|\\.)*')|(\/?>)|(\{[^}]*\})|(\/\/[^\n]*)|([^<"'{/]+)/g;
  let match;
  while ((match = regex.exec(code)) !== null) {
    if (match[1]) parts.push({ text: match[1], cls: "text-[#7cacf8]" }); // tag
    else if (match[2]) parts.push({ text: match[2], cls: "text-[#d4a0f5]" }); // attr name
    else if (match[3]) parts.push({ text: match[3], cls: "text-[#a8d4a2]" }); // double-quoted string
    else if (match[4]) parts.push({ text: match[4], cls: "text-[#a8d4a2]" }); // single-quoted string
    else if (match[5]) parts.push({ text: match[5], cls: "text-[#7cacf8]" }); // closing bracket
    else if (match[6]) parts.push({ text: match[6], cls: "text-[#e8c882]" }); // JSX expression
    else if (match[7]) parts.push({ text: match[7], cls: "text-[#6a6a7a]" }); // comment
    else if (match[8]) parts.push({ text: match[8], cls: "text-[#c8c8d0]" }); // plain text
  }
  return parts;
}

function CodeBlock({ code, onCopy }: { code: string; onCopy: () => void }) {
  const [copied, setCopied] = useState(false);
  const highlighted = highlightHtml(code);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopy();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: noop
    }
  }

  return (
    <div className="group relative rounded-lg border border-[#1e1e2a] bg-[#0d0d12] overflow-hidden">
      <button
        onClick={handleCopy}
        className="absolute right-1.5 top-1.5 z-10 inline-flex items-center gap-1 rounded-md bg-[#1e1e2a] px-2 py-1 text-[10px] font-medium text-[#9ca3af] opacity-0 transition-all hover:bg-[#2a2a3a] hover:text-[#e0e0e8] group-hover:opacity-100"
      >
        {copied ? (
          <>
            <Check className="size-3 text-emerald-400" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="size-3" />
            Copy
          </>
        )}
      </button>
      <pre className="overflow-x-auto p-3 text-[11px] leading-relaxed font-mono">
        <code>
          {highlighted.map((part, i) => (
            <span key={i} className={part.cls}>{part.text}</span>
          ))}
        </code>
      </pre>
    </div>
  );
}

function EmbedCodePanel({ wallId }: { wallId: string }) {
  const [tab, setTab] = useState<EmbedTab>("html");

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const embedUrl = `${origin}/embed/${wallId}`;

  const snippets: Record<EmbedTab, { code: string; hint: string }> = {
    html: {
      code: `<div data-laudica="${wallId}"></div>\n<script src="${origin}/embed.js" async></script>`,
      hint: "Add this to any HTML page. The script handles rendering and resizing automatically.",
    },
    iframe: {
      code: `<iframe\n  id="laudica-${wallId.slice(0, 8)}"\n  src="${embedUrl}"\n  style="width:100%;border:none;min-height:100px;margin:2rem 0"\n  scrolling="no"\n  loading="lazy"\n  title="Laudica testimonials"\n></iframe>\n<script>\nwindow.addEventListener("message", function(e) {\n  if (e.data && e.data.type === "laudica-resize") {\n    var f = document.getElementById("laudica-${wallId.slice(0, 8)}");\n    if (f) f.style.height = e.data.height + "px";\n  }\n});\n</script>`,
      hint: "Self-contained embed with auto-resize. Works anywhere iframes are supported.",
    },
    react: {
      code: `import { useEffect, useRef } from "react";\n\nfunction Laudica() {\n  const ref = useRef<HTMLIFrameElement>(null);\n\n  useEffect(() => {\n    function onMsg(e: MessageEvent) {\n      if (e.data?.type === "laudica-resize" && ref.current) {\n        ref.current.style.height = e.data.height + "px";\n      }\n    }\n    window.addEventListener("message", onMsg);\n    return () => window.removeEventListener("message", onMsg);\n  }, []);\n\n  return (\n    <iframe\n      ref={ref}\n      src="${embedUrl}"\n      style={{ width: "100%", border: "none", minHeight: 100, margin: "2rem 0" }}\n      scrolling="no"\n      loading="lazy"\n      title="Laudica testimonials"\n    />\n  );\n}`,
      hint: "Drop this component into your React or Next.js app. Auto-resizes to fit content.",
    },
    preview: {
      code: embedUrl,
      hint: "Open this URL to preview your wall. Domain restrictions still apply when embedded on websites.",
    },
  };

  const current = snippets[tab];

  return (
    <div className="space-y-2">
      {/* Tab bar */}
      <div className="flex rounded-lg border border-border bg-muted/30 p-0.5">
        {embedTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-md px-1.5 py-1.5 text-[10px] font-medium transition-all ${
              tab === t.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Code block */}
      <CodeBlock code={current.code} onCopy={() => {}} />

      {/* Hint */}
      <p className="text-[10px] leading-relaxed text-muted-foreground">
        {current.hint}
      </p>
    </div>
  );
}
