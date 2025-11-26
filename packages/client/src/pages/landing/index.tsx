import BentoGridSection from "./bento-grid-section";
import FeaturesBento from "./features-bento";
import FooterSection from "./footer-section";
import HeroSection from "./hero-section";
import LandingNavbar from "./landing-nav";
import TestimonialSection from "./testimonial-section";
import TrustedCompanies from "./trusted-companies";
import WaitlistNewSection from "./waitlist-new";

export default function LandingPage() {
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

			{/* Newsletter Section */}
			<WaitlistNewSection />

			<div className="h-[var(--section-gap)]" />

			{/* <PricingSection /> */}

			{/* Footer Section */}
			<FooterSection />
		</div>
	);
}
