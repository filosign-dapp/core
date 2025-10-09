import { useFilosignMutation } from "@filosign/sdk/react";
import { CaretLeftIcon } from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import Logo from "@/src/lib/components/custom/Logo";
import { Button } from "@/src/lib/components/ui/button";
import { Form } from "@/src/lib/components/ui/form";
import { useStorePersist } from "@/src/lib/hooks/use-store";
import type { EnvelopeForm } from "../types";
import DocumentsSection from "./_components/DocumentUpload";
import RecipientsSection from "./_components/RecipientsSection";

export default function CreateEnvelopePage() {
	const navigate = useNavigate();
	const { setCreateForm } = useStorePersist();
	const queryClient = useQueryClient();

	// SDK mutations for file uploads
	const uploadFile = useFilosignMutation(["files", "uploadFile"]);

	const form = useForm<EnvelopeForm>({
		defaultValues: {
			recipients: [{ name: "", email: "", walletAddress: "", role: "signer" }],
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

	const onSubmit = async (data: EnvelopeForm) => {
		if (!data.documents || data.documents.length === 0) {
			toast.error("Please upload at least one document");
			return;
		}

		if (
			!data.recipients ||
			data.recipients.length === 0 ||
			!data.recipients[0].walletAddress
		) {
			toast.error("Please select at least one recipient");
			return;
		}

		try {
			toast.loading("Uploading documents...", { id: "upload-progress" });

			// Upload each file to the SDK
			const uploadPromises = data.documents.map(async (doc) => {
				const fileData = new Uint8Array(await doc.file.arrayBuffer());
				const recipientAddresses = data.recipients
					.filter((r) => r.walletAddress)
					.map((r) => r.walletAddress as `0x${string}`);

				const result = await uploadFile.mutateAsync({
					data: fileData,
					recipientAddresses,
					metadata: {
						fileName: doc.name,
						fileSize: doc.size,
						fileType: doc.type,
						message: data.emailMessage,
						originalId: doc.id,
					},
				});

				return {
					id: doc.id,
					pieceCid: result.pieceCid,
					name: doc.name,
					type: doc.type,
					size: doc.size,
					// Keep data URL for preview if needed
					dataUrl:
						doc.type.includes("image") || doc.type.includes("pdf")
							? await new Promise<string>((resolve, reject) => {
									const reader = new FileReader();
									reader.onload = () => resolve(reader.result as string);
									reader.onerror = reject;
									reader.readAsDataURL(doc.file);
								})
							: undefined,
				};
			});

			const uploadedDocuments = await Promise.all(uploadPromises);

			toast.success("Documents uploaded successfully!", {
				id: "upload-progress",
			});

			// Wait for 1 second then navigate back to dashboard
			setTimeout(() => {
				navigate({ to: "/dashboard" });
			}, 1000);
		} catch (error) {
			console.error("Failed to upload documents:", error);
			toast.error("Failed to upload documents. Please try again.", {
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
					<h3>Create New Envelope</h3>
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
							disabled={uploadFile.isPending}
						>
							{uploadFile.isPending ? "Uploading..." : "Send Envelope"}
						</Button>
					</motion.div>
				</form>
			</Form>
		</div>
	);
}
