import { SignOutIcon } from "@phosphor-icons/react";
import { usePrivy } from "@privy-io/react-auth";
import { formatEther } from "viem";
import { useBalance } from "wagmi";
import { Button } from "@/src/lib/components/ui/button";
import { Separator } from "@/src/lib/components/ui/separator";
import FooterSection from "./footer-section";
import HeroSection from "./hero-section";
import LandingNavbar from "./landing-nav";
import WaitlistSection from "./waitlist-section";
import PricingSection from "./pricing-section";

export default function LandingPage() {
	const { user } = usePrivy();
	const { data: balance } = useBalance({
		address: user?.wallet?.address as `0x${string}`,
	});

	console.log({ balance });


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

			<PricingSection />

			<Separator className="mt-16 md:mt-56" />

			{/* Footer Section */}
			<FooterSection />
		</div>
	);
}
