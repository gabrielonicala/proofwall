export type WallStyle =
  | "cards-grid"
  | "carousel"
  | "ticker-tape"
  | "fade-rotator"
  | "minimal-list"
  | "masonry"
  | "marquee"
  | "spotlight-stack"
  | "orbit";

export interface WallConfig {
  theme: "dark" | "light" | "auto";
  bgColor: string;
  textColor: string;
  accentColor: string;
  starColor: string;
  font: "system" | "inter" | "serif" | "mono";
  showRating: boolean;
  showPhoto: boolean;
  showCompany: boolean;
  showDate: boolean;
  showBranding: boolean;
  borderRadius: "none" | "subtle" | "rounded" | "pill";
  cardStyle: "bordered" | "shadow" | "glass" | "flat";
  sort: "newest" | "highest" | "random";
  speed: "slow" | "normal" | "fast";
  autoplay: boolean;
  pauseOnHover: boolean;
  onlyWithPhotos: boolean;
  fillRows: boolean;
  allowedDomains: string[];
}

export const defaultWallConfig: WallConfig = {
  theme: "dark",
  bgColor: "",
  textColor: "",
  accentColor: "",
  starColor: "",
  font: "system",
  showRating: true,
  showPhoto: true,
  showCompany: true,
  showDate: false,
  showBranding: true,
  borderRadius: "rounded",
  cardStyle: "bordered",
  sort: "newest",
  speed: "normal",
  autoplay: true,
  pauseOnHover: true,
  onlyWithPhotos: false,
  fillRows: false,
  allowedDomains: [],
};

export const styleLabels: Record<WallStyle, string> = {
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

export const styleDescriptions: Record<WallStyle, string> = {
  "cards-grid": "Responsive grid of testimonial cards",
  carousel: "Horizontal sliding carousel",
  "ticker-tape": "Horizontal continuous scroll",
  "fade-rotator": "Single testimonial crossfade",
  "minimal-list": "Clean, borderless vertical list",
  masonry: "Pinterest-style staggered grid",
  marquee: "Vertical continuous scroll",
  "spotlight-stack": "Large featured card with stack",
  orbit: "3D orbital carousel with depth",
};

export const allStyles: WallStyle[] = [
  "cards-grid",
  "carousel",
  "ticker-tape",
  "fade-rotator",
  "minimal-list",
  "masonry",
  "marquee",
  "spotlight-stack",
  "orbit",
];

/** Styles that support speed/autoplay controls */
export const animatedStyles: WallStyle[] = [
  "carousel",
  "ticker-tape",
  "fade-rotator",
  "marquee",
  "orbit",
];

/** Styles that render cards (support card style & border radius) */
export const cardBasedStyles: WallStyle[] = [
  "cards-grid",
  "carousel",
  "ticker-tape",
  "masonry",
  "marquee",
  "spotlight-stack",
  "orbit",
];

/** Styles that render star ratings */
export const ratingStyles: WallStyle[] = [
  "cards-grid",
  "carousel",
  "ticker-tape",
  "fade-rotator",
  "masonry",
  "marquee",
  "spotlight-stack",
  "orbit",
];

/** Styles that render author photos */
export const photoStyles: WallStyle[] = [
  "cards-grid",
  "carousel",
  "ticker-tape",
  "fade-rotator",
  "masonry",
  "marquee",
  "spotlight-stack",
  "orbit",
];
