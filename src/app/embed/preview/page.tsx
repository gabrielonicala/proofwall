"use client";

import { useEffect, useState } from "react";
import { type Testimonial } from "@/data/sample-testimonials";
import { type WallStyle, type WallConfig, defaultWallConfig } from "@/lib/wall-config";
import { getThemeVars } from "@/lib/showcase-helpers";
import { EmbedShowcase } from "../[id]/embed-showcase";

interface PreviewData {
  style: WallStyle;
  config: WallConfig;
  testimonials: Testimonial[];
}

export default function EmbedPreviewPage() {
  const [data, setData] = useState<PreviewData | null>(null);

  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      if (e.data?.type !== "laudica-preview") return;
      setData({
        style: e.data.style,
        config: { ...defaultWallConfig, ...e.data.config },
        testimonials: e.data.testimonials ?? [],
      });
    }
    window.addEventListener("message", handleMessage);
    // Signal to parent that we're ready to receive data
    window.parent.postMessage({ type: "laudica-preview-ready" }, "*");
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px", color: "#888", fontSize: "14px" }}>
        Loading preview...
      </div>
    );
  }

  const { style, config, testimonials } = data;
  const isLight = config.theme === "light";
  const isTransparent = config.theme === "transparent" || config.bgTransparent;
  const isCustom = config.theme === "custom";
  const colorOverrides = (isCustom || isTransparent) && config.cardColor
    ? { bgColor: isCustom ? (config.bgColor || undefined) : undefined, cardColor: config.cardColor }
    : isCustom && config.bgColor
      ? { bgColor: config.bgColor }
      : undefined;
  const themeVars = getThemeVars(config.theme, colorOverrides);

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
          padding: `${config.embedPadding ?? 3}rem ${config.embedPaddingX ?? 3}rem`,
          ...themeVars,
          ...fadeStyle,
        }}
      >
        {testimonials.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "200px", color: "#888", fontSize: "14px" }}>
            No testimonials to preview.
          </div>
        ) : (
          <div style={{ padding: "1rem" }}>
            <EmbedShowcase style={style} config={config} testimonials={testimonials} />
          </div>
        )}
      </div>
    </>
  );
}
