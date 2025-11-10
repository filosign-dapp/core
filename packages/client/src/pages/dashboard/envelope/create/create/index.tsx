import { useSendFile, useUserProfileByQuery } from "@filosign/react/hooks";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import Logo from "@/src/lib/components/custom/Logo";
import { Button } from "@/src/lib/components/ui/button";
import { Form } from "@/src/lib/components/ui/form";
import type { EnvelopeForm } from "../types";
import DocumentsSection from "./_components/DocumentUpload";
import RecipientsSection from "./_components/RecipientsSection";

export default function CreateEnvelopePage() {
	const navigate = useNavigate();

	// SDK mutations for file uploads
	const sendFile = useSendFile();

	const form = useForm<EnvelopeForm>({
		defaultValues: {
			recipient: { name: "", email: "", walletAddress: "", role: "signer" },
			emailMessage: "",
			documents: [],
		},
	});

	const {
		fields: documentFields,
		append: appendDocument,
		remove: removeDocument,
	} = useFieldArray({
		control: form.control,
		name: "documents",
	});

	const { watch } = form;
	const selectedRecipient = watch("recipient");

	// Get recipient profile data for encryption key
	const recipientProfile = useUserProfileByQuery({
		address: selectedRecipient?.walletAddress as `0x${string}` | undefined
	});

	const onSubmit = async (data: EnvelopeForm) => {
		if (!data.documents || data.documents.length === 0) {
			toast.error("Please upload at least one document");
			return;
		}

		if (!data.recipient || !data.recipient.walletAddress) {
			toast.error("Please select a recipient");
			return;
		}

		if (!recipientProfile.data) {
			toast.error("Loading recipient information...");
			return;
		}

		try {
			toast.loading("Sending documents...", { id: "upload-progress" });

			// Send each document to the recipient
			const sendPromises = [];
			for (const doc of data.documents) {
				const fileData = new Uint8Array(await doc.file.arrayBuffer());

				sendPromises.push(
					sendFile.mutateAsync({
						bytes: fileData,
						signaturePositionOffset: {
							top: 10, // Default position - you might want to make this configurable
							left: 10,
						},
						recipient: {
							address: recipientProfile.data!.walletAddress as `0x${string}`,
							encryptionPublicKey: recipientProfile.data!.encryptionPublicKey,
						},
						metadata: {
							name: doc.file.name,
							mimeType: doc.file.type,
						}
					})
				);
			}

			await Promise.all(sendPromises);

			toast.success("Documents sent successfully!", {
				id: "upload-progress",
			});

			// Wait for 1 second then navigate back to dashboard
			setTimeout(() => {
				navigate({ to: "/dashboard" });
			}, 1000);
		} catch (error) {
			console.error("Failed to send documents:", error);
			toast.error("Failed to send documents. Please try again.", {
				id: "upload-progress",
			});
		}
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="flex sticky top-0 z-50 justify-between items-center px-8 h-16 border-b glass bg-background/50 border-border">
				<div className="flex gap-4 items-center">
					<Logo
						className="px-0"
						textClassName="text-foreground font-bold"
						iconOnly
					/>
					<h3>Create New Document</h3>
				</div>
			</header>

			{/* Main Content */}
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<main className="p-8 mx-auto space-y-8 max-w-4xl">
						<DocumentsSection
							control={form.control}
							fields={documentFields}
							append={appendDocument}
							remove={removeDocument}
						/>
						<RecipientsSection control={form.control} />
					</main>
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{
							type: "spring",
							stiffness: 230,
							damping: 25,
							delay: 0.7,
						}}
						className="flex justify-end p-8 pt-0 mx-auto max-w-4xl gap-4"
					>
						<Button
							type="button"
							variant="ghost"
							size="lg"
							className="gap-2"
							asChild
						>
							<Link to="/dashboard">Back</Link>
						</Button>
						<Button
							type="submit"
							variant="primary"
							size="lg"
							className="gap-2 group transition-all duration-200"
							disabled={sendFile.isPending}
						>
							{sendFile.isPending ? "Sending..." : "Send Envelope"}
						</Button>
					</motion.div>
				</form>
			</Form>
		</div>
	);
}
