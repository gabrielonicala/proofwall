import { createClient } from "@/lib/supabase/server";
import { type WallStyle, type WallConfig, defaultWallConfig } from "@/lib/wall-config";
import { type DbTestimonial, toShowcaseTestimonial } from "@/lib/transform-testimonials";
import { getThemeVars } from "@/lib/showcase-helpers";
import { EmbedShowcase } from "./embed-showcase";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EmbedPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch the wall (must be active)
  const { data: wall } = await supabase
    .from("walls")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (!wall) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "200px",
          fontFamily: "system-ui, sans-serif",
          color: "#888",
          fontSize: "14px",
        }}
      >
        Wall not found or inactive.
      </div>
    );
  }

  const style = wall.style as WallStyle;
  const config: WallConfig = { ...defaultWallConfig, ...(wall.config as Partial<WallConfig>) };
  const tagFilter: string[] = wall.tag_filter ?? [];

  // Fetch testimonials for this wall's project
  const { data: testimonialRows } = await supabase
    .from("testimonials")
    .select("*")
    .eq("project_id", wall.project_id)
    .in("status", ["approved", "featured"])
    .order("created_at", { ascending: false });

  // Fetch tags + tag links for filtering
  const { data: tagRows } = await supabase
    .from("tags")
    .select("*")
    .eq("project_id", wall.project_id);

  const { data: tagLinks } = await supabase
    .from("testimonial_tags")
    .select("testimonial_id, tag_id");

  const tagMap = new Map<string, { id: string; name: string; color: string }>();
  (tagRows ?? []).forEach((t) => tagMap.set(t.id, t));

  const testimonialTags = new Map<string, { id: string; name: string; color: string }[]>();
  (tagLinks ?? []).forEach((link) => {
    const tag = tagMap.get(link.tag_id);
    if (tag) {
      const existing = testimonialTags.get(link.testimonial_id) ?? [];
      existing.push(tag);
      testimonialTags.set(link.testimonial_id, existing);
    }
  });

  // Build the DbTestimonial array
  let filtered: DbTestimonial[] = (testimonialRows ?? []).map((t) => ({
    ...t,
    tags: testimonialTags.get(t.id) ?? [],
  }));

  // Apply tag filter
  if (tagFilter.length > 0) {
    filtered = filtered.filter((t) =>
      t.tags.some((tag) => tagFilter.includes(tag.id))
    );
  }

  // Apply photo filter
  if (config.onlyWithPhotos) {
    filtered = filtered.filter((t) => !!t.author_photo);
  }

  // Sort
  if (config.sort === "highest") {
    filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  } else if (config.sort === "random") {
    filtered.sort(() => Math.random() - 0.5);
  }
  // "newest" is default from DB order

  // Max testimonials
  if (wall.max_testimonials && wall.max_testimonials > 0) {
    filtered = filtered.slice(0, wall.max_testimonials);
  }

  const testimonials = filtered.map(toShowcaseTestimonial);

  const isLight = config.theme === "light";
  const themeVars = getThemeVars(config.theme);

  return (
    <div
      className={isLight ? "light" : ""}
      style={{
        minHeight: "100px",
        background: "var(--background)",
        ...themeVars,
      }}
    >
      {testimonials.length === 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "200px",
            fontFamily: "system-ui, sans-serif",
            color: "#888",
            fontSize: "14px",
          }}
        >
          No testimonials to display.
        </div>
      ) : (
        <div style={{ padding: "1rem" }}>
          <EmbedShowcase
            style={style}
            config={config}
            testimonials={testimonials}
          />
        </div>
      )}
    </div>
  );
}
