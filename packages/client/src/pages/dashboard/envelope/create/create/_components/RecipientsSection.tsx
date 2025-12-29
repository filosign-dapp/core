import { useAcceptedPeople } from "@filosign/react/hooks";
import {
	CaretDownIcon,
	MagnifyingGlassIcon,
	MinusIcon,
	PlusIcon,
	UsersThree,
	XIcon,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useState } from "react";
import type {
	Control,
	FieldArrayWithId,
	UseFieldArrayAppend,
	UseFieldArrayRemove,
} from "react-hook-form";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/src/lib/components/ui/select";
import { Textarea } from "@/src/lib/components/ui/textarea";
import { cn } from "@/src/lib/utils/utils";
import type { EnvelopeForm, Recipient } from "../../types";

interface RecipientsSectionProps {
	control: Control<EnvelopeForm>;
	fields: FieldArrayWithId<EnvelopeForm, "recipients", "id">[];
	append: UseFieldArrayAppend<EnvelopeForm, "recipients">;
	remove: UseFieldArrayRemove;
}

export default function RecipientsSection({
	control,
	fields,
	append,
	remove,
}: RecipientsSectionProps) {
	const [isRecipientsOpen, setIsRecipientsOpen] = useState(true);
	const { data: acceptedPeople, refetch } = useAcceptedPeople();

	const handleAddRecipient = (person: {
		walletAddress: string;
		displayName: string | null;
		username: string | null;
	}) => {
		append({
			name: person.displayName || person.username || person.walletAddress,
			email: "",
			walletAddress: person.walletAddress,
			role: "signer",
		});
	};

	// Get list of already selected wallet addresses
	const selectedWalletAddresses = fields.map((field) => field.walletAddress);

	// Filter out already selected people
	const availablePeople =
		acceptedPeople?.people.filter(
			(person) => !selectedWalletAddresses.includes(person.walletAddress),
		) || [];

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
							Recipients {fields.length > 0 && `(${fields.length})`}
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
						{/* Recipients List */}
						<div className="space-y-3">
							<FormLabel>Recipients</FormLabel>
							{fields.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-8 px-4 border border-dashed rounded-lg bg-muted/30">
									<UsersThree
										className="w-10 h-10 mb-3 text-muted-foreground opacity-50"
										weight="duotone"
									/>
									<p className="text-sm font-medium text-muted-foreground">
										No recipients added
									</p>
									<p className="text-xs mt-1 text-center text-muted-foreground">
										Add recipients below to get started
									</p>
								</div>
							) : (
								<div className="space-y-2">
									{fields.map((field, index) => (
										<FormField
											key={field.id}
											control={control}
											name={`recipients.${index}`}
											rules={{
												required: "Recipient is required",
											}}
											render={({ field: formField }) => (
												<FormItem>
													<FormControl>
														<div className="flex items-center gap-2 p-3 border rounded-lg bg-background hover:bg-accent/50 transition-colors">
															<div className="flex-1 min-w-0">
																<div className="flex items-center gap-2">
																	<span className="text-sm font-medium text-foreground">
																		{formField.value.name ||
																			formField.value.walletAddress.slice(
																				0,
																				6,
																			) +
																				"..." +
																				formField.value.walletAddress.slice(-4)}
																	</span>
																	{formField.value.role && (
																		<span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
																			{formField.value.role}
																		</span>
																	)}
																</div>
																<p className="text-xs text-muted-foreground mt-0.5 truncate">
																	{formField.value.walletAddress}
																</p>
															</div>
															<Button
																type="button"
																variant="ghost"
																size="icon"
																className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
																onClick={() => remove(index)}
																aria-label={`Remove recipient ${index + 1}`}
															>
																<XIcon className="size-4" />
															</Button>
														</div>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									))}
								</div>
							)}
						</div>

						{/* Add Recipient */}
						<div className="space-y-2">
							<FormLabel>Add Recipient</FormLabel>
							{availablePeople.length > 0 ? (
								<Select
									onValueChange={(value) => {
										const selectedPerson = availablePeople.find(
											(person) => person.walletAddress === value,
										);
										if (selectedPerson) {
											handleAddRecipient(selectedPerson);
										}
									}}
									value=""
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select a recipient to add" />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{availablePeople.map((person) => (
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
							) : (
								<div className="flex flex-col items-center justify-center py-4 px-4 border border-dashed rounded-lg bg-muted/30">
									<UsersThree
										className="w-8 h-8 mb-2 text-muted-foreground opacity-50"
										weight="duotone"
									/>
									<p className="text-sm text-muted-foreground text-center">
										{acceptedPeople?.people &&
										acceptedPeople.people.length === 0
											? "No recipients available yet"
											: "All available recipients have been added"}
									</p>
									<p className="text-xs mt-1 text-center text-muted-foreground">
										Send sharing requests to add more people you can send
										documents to.
									</p>
								</div>
							)}
							<div className="pt-2">
								<AddRecipientDialog
									onSuccess={() => refetch()}
									trigger={
										<Button
											type="button"
											variant="outline"
											size="sm"
											className="w-full"
										>
											<PlusIcon className="w-4 h-4 mr-2" />
											Add new recipient
										</Button>
									}
								/>
							</div>
						</div>

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
