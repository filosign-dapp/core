import { CaretRightIcon } from "@phosphor-icons/react";
import { useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useState } from "react";
import Logo from "@/src/lib/components/custom/Logo";
import { Button } from "@/src/lib/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/src/lib/components/ui/card";
import { Input } from "@/src/lib/components/ui/input";
import { Label } from "@/src/lib/components/ui/label";
import { useStorePersist } from "@/src/lib/hooks/use-store";

export default function OnboardingWelcomePage() {
	const [name, setName] = useState("John Doe");
	const navigate = useNavigate();
	const { setOnboardingForm } = useStorePersist();

	const handleContinue = () => {
		if (name.trim()) {
			setOnboardingForm({ name: name.trim(), pin: "", hasOnboarded: false });
			navigate({ to: "/onboarding/create-signature" });
		}
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && name.trim()) {
			handleContinue();
		}
	};

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
						<CardTitle>Welcome aboard!</CardTitle>
						<CardDescription>
							Let's get you set up with filosign.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex flex-col gap-2">
							<Label>What's your name?</Label>
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
								onKeyDown={handleKeyPress}
								placeholder="John Doe"
								autoFocus
							/>
						</div>
						<Button
							onClick={handleContinue}
							disabled={!name.trim()}
							className="w-full group"
							variant="primary"
						>
							Continue
							<CaretRightIcon
								className="transition-transform duration-200 size-4 group-hover:translate-x-1"
								weight="bold"
							/>
						</Button>
					</CardContent>
				</Card>
			</motion.div>
		</div>
	);
}
