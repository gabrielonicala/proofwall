import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { type WallStyle, type WallConfig, defaultWallConfig } from "@/lib/wall-config";
import { type DbTestimonial, toShowcaseTestimonial } from "@/lib/transform-testimonials";
import { getThemeVars } from "@/lib/showcase-helpers";
import { EmbedShowcase } from "./embed-showcase";
import { EmbedResize } from "./embed-resize";

function isDomainAllowed(allowedDomains: string[], referer: string | null): boolean {
  if (allowedDomains.length === 0) return true; // no restrictions
  if (!referer) return true; // direct access / no referer is OK (preview, dev)
  try {
    const hostname = new URL(referer).hostname.toLowerCase();
    return allowedDomains.some((domain) => {
      const d = domain.toLowerCase().trim();
      if (!d) return false;
      // Validate the allowed domain is a proper domain (not empty, no protocol)
      // Must not contain path separators or protocol markers
      if (d.includes("/") || d.includes(":")) return false;
      // Exact match
      if (hostname === d) return true;
      // Subdomain match — ensure the dot is at a boundary
      // e.g. "example.com" allows "www.example.com" but NOT "fakeexample.com"
      if (hostname.endsWith(`.${d}`)) return true;
      return false;
    });
  } catch {
    return false;
  }
}

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

  // Check if branding should be shown (free plan only)
  const { data: project } = await supabase
    .from("projects")
    .select("plan")
    .eq("id", wall.project_id)
    .single();

  const showBranding = project?.plan === "free";

  // Domain lock check
  const headersList = await headers();
  const referer = headersList.get("referer");
  if (!isDomainAllowed(config.allowedDomains ?? [], referer)) {
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
        This embed is not authorized for this domain.
      </div>
    );
  }
  // Track view (fire-and-forget — don't block render)
  supabase
    .from("wall_views")
    .insert({ wall_id: id, referrer: referer ?? null })
    .then(() => {});

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

  // Exclude individual testimonials
  const excludedIds: string[] = wall.excluded_ids ?? [];
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

  // Max testimonials
  if (wall.max_testimonials && wall.max_testimonials > 0) {
    filtered = filtered.slice(0, wall.max_testimonials);
  }

  const testimonials = filtered.map(toShowcaseTestimonial);

  const isLight = config.theme === "light";
  const isTransparent = config.theme === "transparent" || config.bgTransparent;
  const isCustom = config.theme === "custom";
  const colorOverrides = (isCustom || isTransparent) && config.cardColor
    ? { bgColor: isCustom ? (config.bgColor || undefined) : undefined, cardColor: config.cardColor }
    : isCustom && config.bgColor
      ? { bgColor: config.bgColor }
      : undefined;
  const themeVars = getThemeVars(config.theme, colorOverrides);

  // For fade effect: gradient from transparent → bg → transparent at edges
  const bgValue = isTransparent
    ? "transparent"
    : isCustom && config.bgColor
      ? config.bgColor
      : "var(--background)";
  const fadeStyle: React.CSSProperties | undefined = config.bgFade && !isTransparent
    ? { background: `linear-gradient(to bottom, transparent, ${bgValue} 40%, ${bgValue} 60%, transparent)` }
    : isTransparent
      ? { background: "transparent" }
      : { background: bgValue };

  return (
    <>
      {(isTransparent || config.bgFade) && (
        <style dangerouslySetInnerHTML={{ __html: "html,body{background:transparent!important}" }} />
      )}
      {isCustom && config.bgColor && !config.bgFade && (
        <style dangerouslySetInnerHTML={{ __html: `body{background:${config.bgColor}!important}` }} />
      )}
    <div
      className={isLight ? "light" : ""}
      style={{
        minHeight: "100px",
        padding: `${config.embedPadding ?? 3}rem max(1rem, min(${config.embedPaddingX ?? 3}rem, 3vw))`,
        ...themeVars,
        ...fadeStyle,
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
      {showBranding && (
        <a
          href="https://laudica.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block",
            textAlign: "center",
            padding: "8px 0 4px",
            fontSize: "11px",
            color: "#888",
            textDecoration: "none",
            opacity: 0.6,
          }}
        >
          Powered by Laudica
        </a>
      )}
      <EmbedResize />
    </div>
    </>
  );
}
