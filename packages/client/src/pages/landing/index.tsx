import LandingNavbar from "./landing-nav";
import HeroSection from "./hero-section";
import WaitlistSection from "./waitlist-section";
import FooterSection from "./footer-section";
import { Separator } from "@/src/lib/components/ui/separator";

export default function LandingPage() {

  return (
    <div className="[--section-gap:4rem]">
      {/* Navbar */}
      <LandingNavbar />

      <div className="h-[var(--section-gap)]" />

      {/* Hero Section */}
      <HeroSection />

      {/* Waitlist Section */}
      <WaitlistSection />

      <Separator />

      {/* Footer Section */}
      <FooterSection />
    </div>
  );
}