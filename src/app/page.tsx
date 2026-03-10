import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { ProblemSolution } from "@/components/landing/problem-solution";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ShowcaseDemo } from "@/components/landing/showcase-demo";
import { SmartWalls } from "@/components/landing/smart-walls";
import { Pricing } from "@/components/landing/pricing";
import { FinalCTA } from "@/components/landing/final-cta";
import { Footer } from "@/components/landing/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProblemSolution />
        <HowItWorks />
        <ShowcaseDemo />
        <SmartWalls />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
