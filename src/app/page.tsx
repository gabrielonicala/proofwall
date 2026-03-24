import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { ProblemSolution } from "@/components/landing/problem-solution";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ShowcaseDemo } from "@/components/landing/showcase-demo";
import { SmartWalls } from "@/components/landing/smart-walls";
import { Pricing } from "@/components/landing/pricing";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Laudica",
  url: "https://laudica.com",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Social proof and testimonial management platform. Collect testimonials, build showcase walls with 9 display styles, and embed them anywhere to increase conversions.",
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
      description:
        "15 testimonials, 3 showcase walls, all 9 display styles.",
      url: "https://laudica.com/signup",
    },
    {
      "@type": "Offer",
      name: "Pro",
      price: "29",
      priceCurrency: "USD",
      description:
        "Unlimited testimonials and walls, custom branding, analytics, priority support.",
      url: "https://laudica.com/signup",
    },
    {
      "@type": "Offer",
      name: "Business",
      price: "79",
      priceCurrency: "USD",
      description:
        "Everything in Pro plus API access, white-label embeds, unlimited team seats.",
      url: "https://laudica.com/signup",
    },
  ],
  publisher: { "@id": "https://laudica.com/#organization" },
  featureList: [
    "Testimonial collection forms",
    "CSV and text import with source tracking",
    "9 showcase display styles",
    "Contextual tag-based walls",
    "Embeddable widgets (HTML, React, iFrame)",
    "View analytics",
    "API access",
    "White-label embedding",
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <Navbar />
      <main>
        <Hero />
        <ProblemSolution />
        <div className="section-divider mx-auto max-w-xl" />
        <HowItWorks />
        <div className="section-divider mx-auto max-w-xl" />
        <ShowcaseDemo />
        <div className="section-divider mx-auto max-w-xl" />
        <SmartWalls />
        <div className="section-divider mx-auto max-w-xl" />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
