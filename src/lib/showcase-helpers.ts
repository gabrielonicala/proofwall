import { type WallConfig } from "@/lib/wall-config";

/** Optional config passed to showcase components — all fields optional for backward compat */
export type ShowcaseConfig = Partial<WallConfig>;

export function getCardClasses(config?: ShowcaseConfig): string {
  const style = config?.cardStyle ?? "bordered";
  const radius = config?.borderRadius ?? "rounded";

  const styleClass =
    style === "bordered"
      ? "border border-border bg-card"
      : style === "shadow"
        ? "bg-card shadow-lg shadow-black/10"
        : style === "glass"
          ? "glass"
          : "bg-card"; // flat

  const radiusClass =
    radius === "none"
      ? "rounded-none"
      : radius === "subtle"
        ? "rounded-md"
        : radius === "pill"
          ? "rounded-3xl"
          : "rounded-xl"; // rounded

  return `${styleClass} ${radiusClass}`;
}

export function getFontClass(config?: ShowcaseConfig): string {
  const font = config?.font ?? "system";
  if (font === "serif") return "font-serif";
  if (font === "mono") return "font-mono";
  return ""; // system & inter use the default Inter font
}

export function shouldShow(
  field: "showRating" | "showPhoto" | "showCompany" | "showDate" | "showBranding",
  config?: ShowcaseConfig
): boolean {
  if (!config) return field !== "showBranding" && field !== "showDate";
  return config[field] ?? (field !== "showBranding" && field !== "showDate");
}

export function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Inline CSS variable overrides for theme. Applied on the preview wrapper. */
export function getThemeVars(
  theme?: "dark" | "light" | "auto"
): React.CSSProperties | undefined {
  if (theme !== "light") return undefined;
  return {
    "--background": "oklch(0.985 0.002 280)",
    "--foreground": "oklch(0.145 0.01 280)",
    "--card": "oklch(1 0 0)",
    "--card-foreground": "oklch(0.145 0.01 280)",
    "--popover": "oklch(1 0 0)",
    "--popover-foreground": "oklch(0.145 0.01 280)",
    "--muted": "oklch(0.94 0.004 280)",
    "--muted-foreground": "oklch(0.5 0.015 250)",
    "--accent": "oklch(0.769 0.171 70)",
    "--accent-foreground": "oklch(0.15 0.01 70)",
    "--border": "oklch(0.91 0.005 280)",
    "--input": "oklch(0.91 0.005 280)",
    "--ring": "oklch(0.457 0.24 277)",
  } as React.CSSProperties;
}
