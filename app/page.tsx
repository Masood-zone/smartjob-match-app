import { CtaSection } from "@/components/sections/home/cta-section";
import { FeaturesSection } from "@/components/sections/home/features-section";
import { HeroSection } from "@/components/sections/home/hero-section";
import { JourneySection } from "@/components/sections/home/journey-section";
import { SiteFooter } from "@/components/sections/home/site-footer";
import { SiteHeader } from "@/components/sections/home/site-header";

export default function HomePage() {
  return (
    <main className="flex-1">
      <SiteHeader />
      <HeroSection />
      <FeaturesSection />
      <JourneySection />
      <CtaSection />
      <SiteFooter />
    </main>
  );
}
