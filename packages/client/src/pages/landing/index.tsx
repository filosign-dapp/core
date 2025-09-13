import LandingNavbar from "./landing-nav";
import HeroSection from "./hero-section";
import WaitlistSection from "./waitlist-section";
import FooterSection from "./footer-section";
import { Separator } from "@/src/lib/components/ui/separator";
import PricingSection from "./pricing-section";

export default function LandingPage() {

  return (
    <div className="[--section-gap:2rem] md:[--section-gap:4rem]">
      {/* Navbar */}
      <LandingNavbar />

      <div className="h-[var(--section-gap)]" />

      {/* Hero Section */}
      <HeroSection />

      {/* Waitlist Section */}
      <WaitlistSection />
      
      <div className="h-[var(--section-gap)]" />

      {/* Pricing Section */}
      <PricingSection />

      <Separator className="mt-16 md:mt-56" />

      {/* Footer Section */}
      <FooterSection />
    </div>
  );
}