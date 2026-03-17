import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Laudica Embed",
  robots: "noindex, nofollow",
};

export default function EmbedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div style={{ margin: 0, padding: 0, background: "transparent", overflowX: "hidden" }}>
      {children}
    </div>
  );
}
