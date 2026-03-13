"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
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
  Copy,
  Check,
  Info,
  Code,
  Globe,
  ExternalLink,
} from "lucide-react";

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
  const [isActive, setIsActive] = useState(true);

  // Data
  const [testimonials, setTestimonials] = useState<DbTestimonial[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Preview
  const [previewWidth, setPreviewWidth] = useState<"full" | "tablet" | "mobile">("full");

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
        setIsActive(wall.is_active);
      }
    }

    setLoading(false);
  }, [project, isNew, params.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
  }, [testimonials, tagFilter, config.sort, config.onlyWithPhotos, maxTestimonials]);

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
            className="border-none bg-transparent text-lg font-semibold outline-none placeholder:text-muted-foreground"
            placeholder="Wall name..."
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Preview size toggles */}
          <div className="flex rounded-lg border border-border">
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
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {isNew ? "Create Wall" : "Save"}
          </button>
        </div>
      </div>

      {/* Editor body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel: Config */}
        <div className="w-72 flex-shrink-0 overflow-y-auto border-r border-border p-4">
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
                  label="ProofWall branding"
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
                <option value="auto">Auto (inherit)</option>
              </select>
            </Section>

            {/* Embed code — only for existing walls */}
            {!isNew && (
              <Section title="Embed Code">
                <EmbedCodePanel wallId={params.id} />
                {!limits.hasWhiteLabel && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Embeds include ProofWall branding.{" "}
                    <a href="/dashboard/settings?tab=billing" className="text-primary underline">
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
        </div>

        {/* Right panel: Preview */}
        <div
          className={`min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-6 transition-colors duration-300 bg-[var(--background)] ${config.theme === "light" ? "light" : ""}`}
          style={getThemeVars(config.theme)}
        >
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <Eye className="size-3.5" />
            Live Preview · {previewTestimonials.length} testimonial{previewTestimonials.length !== 1 ? "s" : ""}
          </div>
          <div
            className={`mx-auto transition-all duration-300 ${previewWidthClass}`}
          >
            {renderPreview()}
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
      code: `<div data-proofwall="${wallId}"></div>\n<script src="${origin}/embed.js" async></script>`,
      hint: "Add this to any HTML page. The script handles rendering and resizing automatically.",
    },
    iframe: {
      code: `<iframe\n  src="${embedUrl}"\n  style="width:100%;border:none;min-height:400px"\n  loading="lazy"\n  title="ProofWall testimonials"\n></iframe>`,
      hint: "Self-contained embed. No JavaScript needed — works anywhere iframes are supported.",
    },
    react: {
      code: `function ProofWall() {\n  return (\n    <iframe\n      src="${embedUrl}"\n      style={{ width: '100%', border: 'none', minHeight: 400 }}\n      loading="lazy"\n      title="ProofWall testimonials"\n    />\n  );\n}`,
      hint: "Drop this component into your React or Next.js app.",
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
