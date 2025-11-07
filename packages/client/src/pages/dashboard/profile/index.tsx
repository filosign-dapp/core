import { zodResolver } from "@hookform/resolvers/zod";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { usePrivy } from "@privy-io/react-auth";
import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useForm } from "react-hook-form";
import Logo from "@/src/lib/components/custom/Logo";
import { Button } from "@/src/lib/components/ui/button";
import { Form } from "@/src/lib/components/ui/form";
import { useStorePersist } from "@/src/lib/hooks/use-store";
import { AccountPreferencesSection } from "./AccountPreferencesSection";
import { useFileUpload } from "./hooks/use-file-upload";
import type { ProfileForm } from "./hooks/use-section-state";
import { useSectionState } from "./hooks/use-section-state";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { PinChangeSection } from "./PinChangeSection";
import { ProfilePictureSection } from "./ProfilePictureSection";
import { profileSchema } from "./types";

export default function ProfilePage() {
	const { onboardingForm } = useStorePersist();
	const { user } = usePrivy();

	const firstName = onboardingForm?.firstName || "";
	const lastName = onboardingForm?.lastName || "";
	const walletAddress = user?.wallet?.address || "";

	const mockProfileData = {
		personal: {
			firstName,
			lastName,
			bio: "",
			walletAddress,
		},
		preferences: {
			emailNotifications: true,
			pushNotifications: false,
			twoFactorAuth: onboardingForm?.hasOnboarded || false,
		},
		profilePicture: null,
		pin: {
			current: "",
			new: "",
			confirm: "",
		},
	};

	const form = useForm<ProfileForm>({
		resolver: zodResolver(profileSchema),
		defaultValues: mockProfileData,
		mode: "onSubmit",
	});

	const personalSection = useSectionState("personal", form, mockProfileData);
	const preferencesSection = useSectionState(
		"preferences",
		form,
		mockProfileData,
	);
	const profilePictureSection = useSectionState(
		"profilePicture",
		form,
		mockProfileData,
	);
	const pinSection = useSectionState("pin", form, mockProfileData);
	const { uploadFile, uploadError } = useFileUpload(form);

	return (
		<div className="min-h-screen">
			{/* Header */}
			<header className="flex sticky top-0 z-50 justify-between items-center px-8 h-16 border-b glass bg-background/50 border-border">
				<div className="flex gap-4 items-center">
					<Logo
						className="px-0"
						textClassName="text-foreground font-bold"
						iconOnly
					/>
					<motion.h3
						initial={{ opacity: 0, x: -10 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{
							type: "spring",
							stiffness: 200,
							damping: 25,
							delay: 0.1,
						}}
					>
						Profile Settings
					</motion.h3>
				</div>
			</header>

			{/* Main Content */}
			<Form {...form}>
				<form>
					<main className="p-8 mx-auto max-w-4xl space-y-8 flex flex-col items-center justify-center min-h-[calc(100dvh-4rem)]">
						<Button
							variant="ghost"
							size="lg"
							className="self-start mb-4"
							asChild
						>
							<Link to="/dashboard">
								<CaretLeftIcon className="size-5" weight="bold" />
								<p>Back</p>
							</Link>
						</Button>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{
								type: "spring",
								stiffness: 200,
								damping: 25,
								delay: 0.2,
							}}
							className="space-y-8 w-full"
						>
							{/* Profile Picture Section */}
							<ProfilePictureSection
								form={form}
								sectionState={profilePictureSection}
								uploadFile={uploadFile}
								uploadError={uploadError}
							/>

							{/* Personal Information */}
							<PersonalInfoSection form={form} sectionState={personalSection} />

							{/* PIN Change */}
							<PinChangeSection form={form} sectionState={pinSection} />

							{/* Account Preferences */}
							<AccountPreferencesSection
								form={form}
								sectionState={preferencesSection}
							/>
						</motion.div>
					</main>
				</form>
			</Form>
		</div>
	);
}
