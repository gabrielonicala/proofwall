import { type WallConfig } from "@/lib/wall-config";

/** Optional config passed to showcase components — all fields optional for backward compat */
export type ShowcaseConfig = Partial<WallConfig>;

export function getCardClasses(config?: ShowcaseConfig): string {
  const style = config?.cardStyle ?? "bordered";
  const radius = config?.borderRadius ?? "rounded";

  const styleClass =
    style === "bordered"
      ? "bg-card"
      : style === "shadow"
        ? "bg-card shadow-xl shadow-black/40"
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

/** Inline border styles for bordered card style */
export function getCardBorderStyle(config?: ShowcaseConfig): React.CSSProperties | undefined {
  if ((config?.cardStyle ?? "bordered") !== "bordered") return undefined;
  const thickness = config?.borderThickness ?? 1;
  const color = config?.borderColor || undefined;
  return {
    border: `${thickness}px solid ${color || "var(--border)"}`,
  };
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
  theme?: "dark" | "light" | "transparent" | "custom" | "auto",
  overrides?: { bgColor?: string; cardColor?: string }
): React.CSSProperties | undefined {
  const vars: Record<string, string> = {};

  if (theme === "light") {
    Object.assign(vars, {
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
    });
  } else if (theme === "transparent") {
    vars["--background"] = "transparent";
  }

  // Custom overrides
  if (overrides?.bgColor) vars["--background"] = overrides.bgColor;
  if (overrides?.cardColor) {
    vars["--card"] = overrides.cardColor;
    vars["--popover"] = overrides.cardColor;
  }

  return Object.keys(vars).length > 0
    ? (vars as unknown as React.CSSProperties)
    : undefined;
}
