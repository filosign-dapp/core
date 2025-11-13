import { useIsRegistered, useLogout } from "@filosign/react/hooks";
import { SignOutIcon } from "@phosphor-icons/react";
import { usePrivy } from "@privy-io/react-auth";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useWalletClient } from "wagmi";
import { Button } from "@/src/lib/components/ui/button";

export default function ConnectButton() {
	const {
		ready,
		authenticated,
		login: loginPrivy,
		logout: logoutPrivy,
	} = usePrivy();
	const isRegistered = useIsRegistered();
	const { data: walletClient } = useWalletClient();
	const logoutFilosign = useLogout();

	// Determine button state for smooth transitions
	const getButtonState = () => {
		if (!ready) return "loading";
		if (!authenticated || isRegistered.isPending) return "signin";
		if (!isRegistered.data) return "get-started";
		return "dashboard";
	};

	const handleLogout = async () => {
		try {
			await logoutFilosign.mutateAsync();
			await logoutPrivy();
		} catch (error) {
			console.error("Logout failed:", error);
		}
	};

	const showLogout =
		authenticated &&
		(getButtonState() === "get-started" || getButtonState() === "dashboard");

	return (
		<motion.div
			className="flex items-center gap-2"
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
			{showLogout && (
				<AnimatePresence>
					<motion.div
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -10 }}
						transition={{
							duration: 0.2,
							ease: "easeInOut",
						}}
					>
						<Button
							variant="secondary"
							onClick={handleLogout}
							disabled={logoutFilosign.isPending}
							className=""
						>
							<SignOutIcon className="size-5" weight="fill" />
						</Button>
					</motion.div>
				</AnimatePresence>
			)}
		</motion.div>
	);
}
