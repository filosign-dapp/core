import { useFilosignMutation, useFilosignQuery } from "@filosign/react";
import { CaretRightIcon } from "@phosphor-icons/react";
import { usePrivy } from "@privy-io/react-auth";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/src/lib/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/src/lib/components/ui/card";
import { Loader } from "@/src/lib/components/ui/loader";
import OtpInput from "@/src/pages/onboarding/_components/OtpInput";
import Logo from "./Logo";

interface DashboardProtectorProps {
	children: React.ReactNode;
}

export default function DashboardProtector({
	children,
}: DashboardProtectorProps) {
	const { ready, authenticated } = usePrivy();
	const isRegistered = useFilosignQuery(["isRegistered"], undefined);
	const isLoggedIn = useFilosignQuery(["isLoggedIn"], undefined);
	const loginMutation = useFilosignMutation(["login"]);
	const queryClient = useQueryClient();
	const navigate = useNavigate();

	const [showPinAuth, setShowPinAuth] = useState(false);
	const [pin, setPin] = useState("");
	const [error, setError] = useState("");

	console.log("isLoggedIn", isLoggedIn.data, isLoggedIn.status);

	useEffect(() => {
		if (
			ready &&
			authenticated &&
			isRegistered.data &&
			!isRegistered.isPending &&
			!isLoggedIn.data &&
			!isLoggedIn.isPending
		) {
			setShowPinAuth(true);
		} else if (
			ready &&
			(!authenticated || !isRegistered.data) &&
			!isRegistered.isPending
		) {
			navigate({ to: "/" });
		}
	}, [
		ready,
		authenticated,
		isRegistered.data,
		isRegistered.isPending,
		isLoggedIn.data,
		isLoggedIn.isPending,
		navigate,
	]);

	const handlePinSubmit = async () => {
		if (pin.length !== 6) return;

		try {
			setError("");
			await loginMutation.mutateAsync({ pin });
			// Invalidate isLoggedIn query to refetch with new JWT
			await queryClient.invalidateQueries({
				queryKey: ["filosign", "isLoggedIn"],
			});
			toast.success("Successfully logged in!");
			setShowPinAuth(false);
			setPin("");
		} catch (error) {
			console.error("PIN authentication failed:", error);
			setError("Invalid PIN. Please try again.");
			setPin("");
			toast.error("Invalid PIN. Please try again.");
		}
	};

	const handleCancel = () => {
		setPin("");
		setError("");
		navigate({ to: "/" });
	};

	// Show loading while checking auth status
	if (!ready || isRegistered.isPending || !isLoggedIn.isSuccess) {
		return <Loader />;
	}

	// If PIN auth is required and not completed, show inline form
	if (showPinAuth) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.3, delay: 0.2 }}
					className="flex flex-col justify-center items-center px-8 mx-auto w-full max-w-lg"
				>
					<Logo
						className="mb-4"
						textClassName="text-foreground font-semibold"
					/>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.3, delay: 0.2 }}
						className="flex flex-col justify-center items-center px-8 mx-auto w-full max-w-lg"
					>
						<Card className="w-full">
							<CardHeader>
								<CardTitle>Enter your PIN</CardTitle>
								<CardDescription>
									Please enter your 6-digit PIN to access your account.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex flex-col gap-2">
									<OtpInput
										value={pin}
										onChange={setPin}
										length={6}
										autoFocus={true}
										onSubmit={handlePinSubmit}
										disabled={loginMutation.isPending}
									/>
								</div>

								{error && <p className="text-destructive text-sm">{error}</p>}

								<div className="flex gap-3">
									<Button
										variant="ghost"
										onClick={handleCancel}
										className="flex-1"
										disabled={loginMutation.isPending}
									>
										Cancel
									</Button>

									<Button
										onClick={handlePinSubmit}
										onKeyDown={(e) => {
											if (e.key === "Enter" && pin.length === 6) {
												handlePinSubmit();
											}
										}}
										disabled={pin.length !== 6 || loginMutation.isPending}
										className="flex-1 group"
										variant="default"
									>
										{loginMutation.isPending ? "Authenticating..." : "Continue"}
										{!loginMutation.isPending && (
											<CaretRightIcon
												className="transition-transform duration-200 size-4 group-hover:translate-x-1"
												weight="bold"
											/>
										)}
									</Button>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</motion.div>
			</div>
		);
	}

	// If all checks pass, render the protected content
	return <>{children}</>;
}
