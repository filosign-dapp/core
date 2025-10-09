import { useFilosignMutation } from "@filosign/sdk/react";
import { CaretRightIcon } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Logo from "@/src/lib/components/custom/Logo";
import { Button } from "@/src/lib/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/src/lib/components/ui/card";
import { useStorePersist } from "@/src/lib/hooks/use-store";
import OtpInput from "./_components/OtpInput";

export default function OnboardingWelcomeCompletePage() {
	const [userName, setUserName] = useState("");
	const [pin, setPin] = useState("");
	const { onboardingForm, setOnboardingForm, clearOnboardingForm } =
		useStorePersist();
	const navigate = useNavigate();
	const login = useFilosignMutation(["login"]);

	useEffect(() => {
		const name = onboardingForm?.name || "there";
		setUserName(name);
	}, [onboardingForm]);

	console.log("onboardingForm", onboardingForm);

	async function handleSubmit() {
		if (pin.length !== 6) return;

		try {
			console.log("onboardingForm", onboardingForm);
			await login.mutateAsync({ pin });

			toast.success("Welcome to Filosign!");
			navigate({ to: "/dashboard" });
		} catch (error) {
			console.error("Failed to login", error);
			toast.error("Login failed. Please check your PIN and try again.");
			setPin(""); // Clear PIN on error
		}
	}

	return (
		<div className="flex justify-center items-center min-h-screen">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.3, delay: 0.2 }}
				className="flex flex-col justify-center items-center px-8 mx-auto w-full max-w-lg"
			>
				<Logo className="mb-4" textClassName="text-foreground font-semibold" />
				<Card className="w-full">
					<CardHeader>
						<CardTitle>All Set, {userName.split(" ")[0]}!</CardTitle>
						<CardDescription>
							Your Filosign account is ready. Enter your PIN to login.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex flex-col gap-2">
							<label className="text-sm font-medium">Your PIN</label>
							<OtpInput
								value={pin}
								onChange={setPin}
								length={6}
								autoFocus={true}
								onSubmit={handleSubmit}
							/>
						</div>

						<Button
							className="w-full group"
							variant="primary"
							onClick={handleSubmit}
							disabled={pin.length !== 6 || login.isPending}
						>
							{login.isPending ? "Logging in..." : "Login to Dashboard"}
							{!login.isPending && (
								<CaretRightIcon
									className="transition-transform duration-200 size-4 group-hover:translate-x-1"
									weight="bold"
								/>
							)}
						</Button>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
