"use client";

import { type Testimonial } from "@/data/sample-testimonials";
import { type WallStyle, type WallConfig } from "@/lib/wall-config";
import { CardsGrid } from "@/components/showcase/cards-grid";
import { Carousel } from "@/components/showcase/carousel";
import { TickerTape } from "@/components/showcase/ticker-tape";
import { FadeRotator } from "@/components/showcase/fade-rotator";
import { MinimalList } from "@/components/showcase/minimal-list";
import { MasonryGrid } from "@/components/showcase/masonry-grid";
import { VerticalMarquee } from "@/components/showcase/vertical-marquee";
import { SpotlightStack } from "@/components/showcase/spotlight-stack";
import { Orbit } from "@/components/showcase/orbit";

interface EmbedShowcaseProps {
  style: WallStyle;
  config: WallConfig;
  testimonials: Testimonial[];
}

export function EmbedShowcase({ style, config, testimonials }: EmbedShowcaseProps) {
  const props = { testimonials, config };
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
