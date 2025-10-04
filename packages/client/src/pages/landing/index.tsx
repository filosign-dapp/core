import LandingNavbar from "./landing-nav";
import HeroSection from "./hero-section";
import WaitlistSection from "./waitlist-section";
import FooterSection from "./footer-section";
import { Separator } from "@/src/lib/components/ui/separator";
import { SignOutIcon } from "@phosphor-icons/react";
import { Button } from "@/src/lib/components/ui/button";
import { usePrivy } from "@privy-io/react-auth";

export default function LandingPage() {
  const { logout } = usePrivy();

  return (
    <div className="[--section-gap:4rem]">
      {/* Navbar */}
      <LandingNavbar />

      <div className="h-[var(--section-gap)]" />

      {/* Hero Section */}
      <HeroSection />

      {/* Waitlist Section */}
      <WaitlistSection />

      <div className="h-[var(--section-gap)]" />

      {/* <PricingSection /> */}

      <Separator className="mt-16 md:mt-56" />

      {/* Footer Section */}
      <FooterSection />
    </div>
  );
}
