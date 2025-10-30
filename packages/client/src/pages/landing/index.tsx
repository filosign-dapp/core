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

export default function LandingPage() {
	const { user, login, logout } = usePrivy();
	const { data: balance } = useBalance({
		address: user?.wallet?.address as `0x${string}`,
	});

	console.log("balance", balance);
	console.log("user", user);

	return (
		<div className="text-2xl flex flex-col gap-2 items-center justify-center h-screen">
			<p>Balance: {formatEther(balance?.value ?? 0n)}</p>
			<Button onClick={() => login()}>Login</Button>
			<Button onClick={() => logout()}>Logout</Button>
		</div>
		// <div className="[--section-gap:4rem]">
		// 	{/* Navbar */}
		// 	<LandingNavbar />

		// 	<div className="h-[var(--section-gap)]" />

		// 	{/* Hero Section */}
		// 	<HeroSection />

		// 	{/* Waitlist Section */}
		// 	<WaitlistSection />

		// 	<div className="h-[var(--section-gap)]" />

		// 	{/* <PricingSection /> */}

		// 	<Separator className="mt-16 md:mt-56" />

		// 	{/* Footer Section */}
		// 	<FooterSection />
		// </div>
	);
}
