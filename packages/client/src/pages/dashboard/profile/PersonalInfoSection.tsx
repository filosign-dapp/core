import { UserIcon } from "@phosphor-icons/react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/src/lib/components/ui/card";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/src/lib/components/ui/form";
import { Input } from "@/src/lib/components/ui/input";
import { Textarea } from "@/src/lib/components/ui/textarea";
import { SaveButton } from "./components/SaveButton";

interface PersonalInfoSectionProps {
	form: any;
	sectionState: {
		hasChanges: boolean;
		state: { isSaving: boolean; isSaved: boolean; error?: string };
		save: () => void;
	};
}

export function PersonalInfoSection({
	form,
	sectionState,
}: PersonalInfoSectionProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex gap-2 items-center">
					<UserIcon className="size-5" />
					Personal Information
				</CardTitle>
				<CardDescription>
					Update your personal details and contact information
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				<FormField
					control={form.control}
					name="personal.walletAddress"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Wallet Address</FormLabel>
							<FormControl>
								<div className="relative">
									<Input
										placeholder="0x..."
										className="font-mono text-sm"
										readOnly
										disabled
										{...field}
									/>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="personal.fullName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Full Name</FormLabel>
							<FormControl>
								<Input placeholder="Enter your full name" {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="personal.bio"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Bio</FormLabel>
							<FormControl>
								<Textarea
									placeholder="Tell us about yourself..."
									rows={3}
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<SaveButton
					show={sectionState.hasChanges || sectionState.state.isSaved}
					onSave={sectionState.save}
					disabled={sectionState.state.isSaved || sectionState.state.isSaving}
					isLoading={sectionState.state.isSaving}
					isSaved={sectionState.state.isSaved}
					error={sectionState.state.error}
				/>
			</CardContent>
		</Card>
	);
}
