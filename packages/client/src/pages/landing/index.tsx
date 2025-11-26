import { usePrivy } from "@privy-io/react-auth";
import { useBalance } from "wagmi";
import { Separator } from "@/src/lib/components/ui/separator";
import BentoGridSection from "./bento-grid-section";
import FeaturesBento from "./features-bento";
import FooterSection from "./footer-section";
import HeroSection from "./hero-section";
import LandingNavbar from "./landing-nav";
import TestimonialSection from "./testimonial-section";
import TrustedCompanies from "./trusted-companies";

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

			{/* Trusted Companies */}
			<TrustedCompanies />

			{/* Features Bento Grid */}
			<FeaturesBento />

			{/* Bento Grid Section */}
			<BentoGridSection />

			{/* Testimonial Section */}
			<TestimonialSection />

			{/* Waitlist Section */}
			{/* <WaitlistSection /> */}

			<div className="h-[var(--section-gap)]" />

			{/* <PricingSection /> */}

			{/* Footer Section */}
			<FooterSection />
		</div>
	);
}
