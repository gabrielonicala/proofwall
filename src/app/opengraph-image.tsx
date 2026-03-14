import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Laudica — Social proof that sells";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0F0F14, #1a1a2e)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <svg width="64" height="64" viewBox="0 0 40 40" fill="none">
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6C3FE8" />
                <stop offset="1" stopColor="#7C3AED" />
              </linearGradient>
            </defs>
            <rect width="40" height="40" rx="10" fill="url(#g)" />
            <path d="M12 20l5 5 11-11" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <span
            style={{
              fontSize: "56px",
              fontWeight: 700,
              background: "linear-gradient(135deg, #6C3FE8, #7C3AED)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Laudica
          </span>
        </div>
        <p
          style={{
            fontSize: "28px",
            color: "#a1a1b5",
            textAlign: "center",
            maxWidth: "700px",
            lineHeight: 1.4,
          }}
        >
          Social proof that sells. Collect testimonials, build showcase walls,
          and embed them anywhere.
        </p>
      </div>
    ),
    { ...size }
  );
}
