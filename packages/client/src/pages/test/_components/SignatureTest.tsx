import { useFilosignMutation, useFilosignQuery } from "@filosign/react";
import {
	EyeIcon,
	FileTextIcon,
	SignatureIcon,
	SpinnerIcon,
	TrashIcon,
	UploadIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "../../../lib/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "../../../lib/components/ui/card";
import { Input } from "../../../lib/components/ui/input";
import { Label } from "../../../lib/components/ui/label";

export function SignatureTest() {
	// Signature operations
	const uploadSignature = useFilosignMutation([
		"signatures",
		"uploadSignature",
	]);
	const getSignatures = useFilosignQuery(
		["signatures", "getSignatures"],
		undefined,
	);
	const deleteSignature = useFilosignMutation([
		"signatures",
		"deleteSignature",
	]);

	// Input states
	const [signatureFile, setSignatureFile] = useState<File | null>(null);
	const [signatureName, setSignatureName] = useState("");
	const [signatureIdToDelete, setSignatureIdToDelete] = useState("");

	const handleSignatureUpload = async () => {
		if (!signatureFile || !signatureName.trim()) return;

		try {
			await uploadSignature.mutateAsync({
				file: signatureFile,
				name: signatureName,
			});
			console.log("Signature uploaded");
			setSignatureFile(null);
			setSignatureName("");
		} catch (error) {
			console.error("Failed to upload signature", error);
		}
	};

	const handleDeleteSignature = async () => {
		if (!signatureIdToDelete.trim()) return;

		try {
			await deleteSignature.mutateAsync(signatureIdToDelete);
			console.log("Signature deleted");
			setSignatureIdToDelete("");
		} catch (error) {
			console.error("Failed to delete signature", error);
		}
	};

	const handleSignatureFileSelect = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (file) {
			setSignatureFile(file);
		}
	};

	return (
		<div className="space-y-6">
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Upload Signature */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<UploadIcon className="w-5 h-5" />
							Upload Signature
						</CardTitle>
						<CardDescription>Upload a signature image or file</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div>
								<Label htmlFor="signature-upload">Select Signature File</Label>
								<Input
									id="signature-upload"
									type="file"
									onChange={handleSignatureFileSelect}
									accept="image/*,.png,.jpg,.jpeg,.svg"
								/>
								{signatureFile && (
									<p className="text-sm text-muted-foreground mt-1">
										Selected: {signatureFile.name} ({signatureFile.size} bytes)
									</p>
								)}
							</div>
							<div>
								<Label htmlFor="signature-name">Signature Name</Label>
								<Input
									id="signature-name"
									placeholder="Enter signature name..."
									value={signatureName}
									onChange={(e) => setSignatureName(e.target.value)}
								/>
							</div>
							<Button
								onClick={handleSignatureUpload}
								disabled={
									!signatureFile ||
									!signatureName.trim() ||
									uploadSignature.isPending
								}
								className="w-full"
								size="lg"
							>
								{uploadSignature.isPending ? (
									<SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
								) : (
									<UploadIcon className="w-4 h-4 mr-2" />
								)}
								Upload Signature
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Delete Signature */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<TrashIcon className="w-5 h-5" />
							Delete Signature
						</CardTitle>
						<CardDescription>
							Delete an existing signature by ID
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div>
								<Label htmlFor="signature-id-delete">Signature ID</Label>
								<Input
									id="signature-id-delete"
									placeholder="Enter signature ID..."
									value={signatureIdToDelete}
									onChange={(e) => setSignatureIdToDelete(e.target.value)}
								/>
							</div>
							<Button
								onClick={handleDeleteSignature}
								disabled={
									!signatureIdToDelete.trim() || deleteSignature.isPending
								}
								variant="destructive"
								className="w-full"
								size="lg"
							>
								{deleteSignature.isPending ? (
									<SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
								) : (
									<TrashIcon className="w-4 h-4 mr-2" />
								)}
								Delete Signature
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Signatures List */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<CardTitle className="text-lg">My Signatures</CardTitle>
						<Button
							onClick={() => getSignatures.refetch()}
							disabled={getSignatures.isFetching}
							variant="outline"
							size="sm"
						>
							{getSignatures.isFetching ? (
								<SpinnerIcon className="w-3 h-3 animate-spin mr-1" />
							) : (
								<SignatureIcon className="w-3 h-3 mr-1" />
							)}
							Refetch
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="bg-muted/50 p-4 rounded-lg min-h-[200px]">
						{getSignatures.isLoading ? (
							<div className="flex items-center gap-2 text-muted-foreground">
								<SpinnerIcon className="w-4 h-4 animate-spin" />
								Loading signatures...
							</div>
						) : getSignatures.data?.signatures?.length ? (
							<div className="space-y-3">
								{getSignatures.data.signatures.map((signature: any) => (
									<div
										key={signature.id}
										className="flex items-center justify-between p-3 bg-background rounded border"
									>
										<div className="flex items-center gap-3">
											<SignatureIcon className="w-5 h-5 text-muted-foreground" />
											<div>
												<p className="font-medium">{signature.name}</p>
												<p className="text-sm text-muted-foreground">
													ID: {signature.id}
												</p>
											</div>
										</div>
										<div className="flex items-center gap-2 text-sm text-muted-foreground">
											<span>
												{new Date(
													signature.createdAt * 1000,
												).toLocaleDateString()}
											</span>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => setSignatureIdToDelete(signature.id)}
												className="h-6 w-6 p-0"
											>
												<TrashIcon className="w-3 h-3" />
											</Button>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="flex flex-col items-center justify-center gap-2 text-muted-foreground py-8">
								<FileTextIcon className="w-8 h-8" />
								<p>No signatures found</p>
								<p className="text-sm">Upload your first signature above</p>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
