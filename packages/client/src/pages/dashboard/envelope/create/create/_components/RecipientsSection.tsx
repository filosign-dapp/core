import { useFilosignQuery } from "@filosign/sdk/react";
import {
	CaretDownIcon,
	MagnifyingGlassIcon,
	PlusIcon,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useState } from "react";
import type { Control } from "react-hook-form";
import { useWatch } from "react-hook-form";
import AddRecipientDialog from "@/src/lib/components/custom/AddRecipientDialog";
import { Button } from "@/src/lib/components/ui/button";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/src/lib/components/ui/collapsible";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/src/lib/components/ui/form";
import { Input } from "@/src/lib/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/src/lib/components/ui/select";
import { Textarea } from "@/src/lib/components/ui/textarea";
import { cn } from "@/src/lib/utils/utils";
import type { EnvelopeForm } from "../../types";

interface RecipientsSectionProps {
	control: Control<EnvelopeForm>;
}

export default function RecipientsSection({ control }: RecipientsSectionProps) {
	const [isRecipientsOpen, setIsRecipientsOpen] = useState(true);

	const { data: allowedRecipients, refetch } = useFilosignQuery(
		["shareCapability", "getPeopleCanSendTo"],
		undefined,
	);

	return (
		<motion.section
			className="space-y-4"
			initial={{ opacity: 0, y: 30 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				type: "spring",
				stiffness: 200,
				damping: 25,
				delay: 0.3,
			}}
		>
			<Collapsible open={isRecipientsOpen} onOpenChange={setIsRecipientsOpen}>
				<CollapsibleTrigger asChild>
					<div className="flex items-center justify-between cursor-pointer hover:bg-accent/50 transition-colors p-2 -m-2 rounded-md group/add-recipients">
						<h4 className="flex items-center gap-3">
							<MagnifyingGlassIcon
								className={cn(
									"size-5 text-muted-foreground group-hover/add-recipients:scale-110 transition-transform duration-200",
									isRecipientsOpen && "scale-110",
								)}
							/>
							Select recipient
						</h4>
						<CaretDownIcon
							className={cn(
								"size-4 text-muted-foreground transition-transform duration-200",
								isRecipientsOpen && "rotate-180",
							)}
							weight="bold"
						/>
					</div>
				</CollapsibleTrigger>

				<CollapsibleContent className="mt-6">
					<div className="space-y-6">
						{/* Recipient Selector */}
						<FormField
							control={control}
							name="recipients.0"
							rules={{
								required: "Please select a recipient",
							}}
							render={({ field }) => (
								<FormItem>
									<FormLabel>Recipient</FormLabel>
									<Select
										onValueChange={(value) => {
											const selectedPerson = allowedRecipients?.people.find(
												(person) => person.walletAddress === value,
											);
											if (selectedPerson) {
												field.onChange({
													name:
														selectedPerson.displayName ||
														selectedPerson.username ||
														selectedPerson.walletAddress,
													email: "", // Email not provided in the API response
													walletAddress: selectedPerson.walletAddress,
													role: "signer",
												});
											}
										}}
										value={field.value?.walletAddress || ""}
									>
										<FormControl>
											<SelectTrigger>
												<SelectValue placeholder="Select a recipient" />
											</SelectTrigger>
										</FormControl>
										<SelectContent
											emptyContent={
												<div className="space-y-3">
													<p className="text-sm text-muted-foreground">
														No recipients available
													</p>
													<AddRecipientDialog
														onSuccess={() => refetch()}
														trigger={
															<Button variant="primary" size="sm" className="">
																<PlusIcon className="w-4 h-4 mr-2" />
																Add Recipient
															</Button>
														}
													/>
												</div>
											}
										>
											{allowedRecipients?.people.map((person) => (
												<SelectItem
													key={person.walletAddress}
													value={person.walletAddress}
												>
													<div className="flex items-center gap-2">
														{person.displayName ||
															person.username ||
															person.walletAddress}
														<span className="text-muted-foreground text-sm">
															({person.walletAddress.slice(0, 6)}...
															{person.walletAddress.slice(-4)})
														</span>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* Message */}
						<FormField
							control={control}
							name="emailMessage"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Message</FormLabel>
									<FormControl>
										<Textarea
											placeholder="Enter your message..."
											className="min-h-[100px]"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</CollapsibleContent>
			</Collapsible>
		</motion.section>
	);
}
