import { useIsRegistered } from "@filosign/react/hooks";
import { usePrivy } from "@privy-io/react-auth";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/src/lib/components/ui/button";

export default function ConnectButton() {
	const { ready, authenticated, login: loginPrivy, user } = usePrivy();
	const isRegistered = useIsRegistered();

	// Determine button state for smooth transitions
	const getButtonState = () => {
		if (!ready) return "loading";
		if (!authenticated || isRegistered.isPending) return "signin";
		if (!isRegistered.data) return "get-started";
		return "dashboard";
	};

	return (
		<motion.div
			className=""
			initial={{ opacity: 0, x: 30 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{
				type: "spring",
				stiffness: 230,
				damping: 30,
				mass: 1.2,
				delay: 0.78,
			}}
		>
			<Button
				variant="secondary"
				onClick={getButtonState() === "signin" ? () => loginPrivy() : undefined}
				asChild={
					getButtonState() === "get-started" || getButtonState() === "dashboard"
				}
				className="min-w-28"
			>
				{getButtonState() === "get-started" ||
					getButtonState() === "dashboard" ? (
					<Link
						to={getButtonState() === "dashboard" ? "/dashboard" : "/onboarding"}
					>
						<AnimatePresence mode="wait">
							<motion.span
								key={getButtonState()}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -10 }}
								transition={{
									duration: 0.2,
									ease: "easeInOut",
									layout: { duration: 0.3 },
								}}
								layout
							>
								{getButtonState() === "dashboard" ? "Dashboard" : "Get started"}
							</motion.span>
						</AnimatePresence>
					</Link>
				) : (
					<AnimatePresence mode="wait">
						<motion.span
							key={getButtonState()}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							transition={{
								duration: 0.2,
								ease: "easeInOut",
								layout: { duration: 0.3 },
							}}
							layout
						>
							Sign In
						</motion.span>
					</AnimatePresence>
				)}
			</Button>
		</motion.div>
	);
}
