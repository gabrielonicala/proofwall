import type { Metadata } from "next";
import { Inter, JetBrains_Mono, DM_Serif_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const dmSerifDisplay = DM_Serif_Display({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = "https://laudica.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Laudica — Social proof that sells",
    template: "%s | Laudica",
  },
  description:
    "Collect stunning social proof. Deploy it strategically. Watch your conversions climb. 9 beautiful showcase styles, smart contextual walls, and paste-to-import.",
  keywords: [
    "testimonials",
    "social proof",
    "reviews",
    "conversion",
    "wall of love",
    "embed testimonials",
    "testimonial widget",
    "customer reviews",
    "social proof software",
  ],
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    siteName: "Laudica",
    title: "Laudica — Social proof that sells",
    description:
      "Collect stunning social proof. Deploy it strategically. Watch your conversions climb.",
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Laudica — Social proof that sells",
    description:
      "Collect stunning social proof. Deploy it strategically. Watch your conversions climb.",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Laudica",
      url: SITE_URL,
      description:
        "The social proof engine for modern SaaS. Collect, organize, and deploy testimonials that convert.",
      email: "support@laudica.com",
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: "Laudica",
      url: SITE_URL,
      publisher: { "@id": `${SITE_URL}/#organization` },
      description:
        "Collect stunning social proof. Deploy it strategically. Watch your conversions climb.",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} ${dmSerifDisplay.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {children}
      </body>
    </html>
  );
}
