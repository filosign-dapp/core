import { useFilosignMutation, useFilosignQuery } from "@filosign/react";
import {
	CheckCircleIcon,
	DownloadIcon,
	EyeIcon,
	FileIcon,
	FileTextIcon,
	SpinnerIcon,
	UploadIcon,
} from "@phosphor-icons/react";
import { useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "../../../lib/components/ui/textarea";

export function FileTest() {
	// File operations
	const uploadFile = useFilosignMutation(["files", "uploadFile"]);
	const getSentFiles = useFilosignQuery(["files", "getSentFiles"], undefined);
	const getReceivedFiles = useFilosignQuery(
		["files", "getReceivedFiles"],
		undefined,
	);
	const getFileDetails = useFilosignMutation(["files", "getFileDetails"]);
	const acknowledgeFile = useFilosignMutation(["files", "acknowledgeFile"]);

	const queryClient = useQueryClient();

	// Input states
	const [fileToUpload, setFileToUpload] = useState<File | null>(null);
	const [recipientAddresses, setRecipientAddresses] = useState("");
	const [fileMetadata, setFileMetadata] = useState("");
	const [pieceCidToView, setPieceCidToView] = useState("");
	const [pieceCidToAcknowledge, setPieceCidToAcknowledge] = useState("");

	// File details state
	const [fileDetails, setFileDetails] = useState<any>(null);

	const handleFileUpload = async () => {
		if (!fileToUpload || !recipientAddresses.trim()) return;

		try {
			const recipients = recipientAddresses
				.split(",")
				.map((addr) => addr.trim() as `0x${string}`);

			const fileData = new Uint8Array(await fileToUpload.arrayBuffer());

			await uploadFile.mutateAsync({
				data: fileData,
				recipientAddresses: recipients,
				metadata: fileMetadata ? JSON.parse(fileMetadata) : undefined,
			});

			console.log("File uploaded successfully");
			setFileToUpload(null);
			setRecipientAddresses("");
			setFileMetadata("");
		} catch (error) {
			console.error("Failed to upload file", error);
		}
	};

	const handleViewFileDetails = async () => {
		if (!pieceCidToView.trim()) return;

		try {
			const result = await getFileDetails.mutateAsync({
				pieceCid: pieceCidToView,
			});
			setFileDetails(result);
			console.log("File details retrieved", result);
		} catch (error) {
			console.error("Failed to get file details", error);
		}
	};

	const handleAcknowledgeFile = async () => {
		if (!pieceCidToAcknowledge.trim()) return;

		try {
			await acknowledgeFile.mutateAsync({
				pieceCid: pieceCidToAcknowledge,
			});
			console.log("File acknowledged");
			setPieceCidToAcknowledge("");
		} catch (error) {
			console.error("Failed to acknowledge file", error);
		}
	};

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setFileToUpload(file);
		}
	};

	return (
		<div className="space-y-6">
			<div className="grid gap-6 lg:grid-cols-2">
				{/* Upload File */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<UploadIcon className="w-5 h-5" />
							Upload File
						</CardTitle>
						<CardDescription>
							Upload an encrypted file to share with recipients
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div>
								<Label htmlFor="file-upload">Select File</Label>
								<Input
									id="file-upload"
									type="file"
									onChange={handleFileSelect}
									accept="*/*"
								/>
								{fileToUpload && (
									<p className="text-sm text-muted-foreground mt-1">
										Selected: {fileToUpload.name} ({fileToUpload.size} bytes)
									</p>
								)}
							</div>
							<div>
								<Label htmlFor="recipient-addresses">
									Recipient Addresses (comma-separated)
								</Label>
								<Input
									id="recipient-addresses"
									placeholder="0x..., 0x..."
									value={recipientAddresses}
									onChange={(e) => setRecipientAddresses(e.target.value)}
								/>
							</div>
							<div>
								<Label htmlFor="file-metadata">Metadata (JSON)</Label>
								<Textarea
									id="file-metadata"
									placeholder='{"title": "My Document", "description": "Important file"}'
									value={fileMetadata}
									onChange={(e) => setFileMetadata(e.target.value)}
									rows={3}
								/>
							</div>
							<Button
								onClick={handleFileUpload}
								disabled={
									!fileToUpload ||
									!recipientAddresses.trim() ||
									uploadFile.isPending
								}
								className="w-full"
								size="lg"
							>
								{uploadFile.isPending ? (
									<SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
								) : (
									<UploadIcon className="w-4 h-4 mr-2" />
								)}
								Upload File
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* View File Details */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<EyeIcon className="w-5 h-5" />
							View File Details
						</CardTitle>
						<CardDescription>
							Get detailed information about a file
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div>
								<Label htmlFor="piece-cid-view">Piece CID</Label>
								<Input
									id="piece-cid-view"
									placeholder="Enter piece CID..."
									value={pieceCidToView}
									onChange={(e) => setPieceCidToView(e.target.value)}
								/>
							</div>
							<Button
								onClick={handleViewFileDetails}
								disabled={!pieceCidToView.trim() || getFileDetails.isPending}
								className="w-full"
								size="lg"
							>
								{getFileDetails.isPending ? (
									<SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
								) : (
									<EyeIcon className="w-4 h-4 mr-2" />
								)}
								View Details
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Acknowledge File */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<CheckCircleIcon className="w-5 h-5" />
						Acknowledge File
					</CardTitle>
					<CardDescription>
						Acknowledge receipt of a shared file (onchain transaction)
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex gap-3">
						<div className="flex-1">
							<Label htmlFor="piece-cid-acknowledge">Piece CID</Label>
							<Input
								id="piece-cid-acknowledge"
								placeholder="Enter piece CID to acknowledge..."
								value={pieceCidToAcknowledge}
								onChange={(e) => setPieceCidToAcknowledge(e.target.value)}
							/>
						</div>
						<Button
							onClick={handleAcknowledgeFile}
							disabled={
								!pieceCidToAcknowledge.trim() || acknowledgeFile.isPending
							}
							className="mt-6"
							size="lg"
						>
							{acknowledgeFile.isPending ? (
								<SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
							) : (
								<CheckCircleIcon className="w-4 h-4 mr-2" />
							)}
							Acknowledge
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* File Lists */}
			<div className="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="text-lg">Sent Files</CardTitle>
							<Button
								onClick={() => getSentFiles.refetch()}
								disabled={getSentFiles.isFetching}
								variant="outline"
								size="sm"
							>
								{getSentFiles.isFetching ? (
									<SpinnerIcon className="w-3 h-3 animate-spin mr-1" />
								) : (
									<FileIcon className="w-3 h-3 mr-1" />
								)}
								Refetch
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<div className="bg-muted/50 p-4 rounded-lg min-h-[100px]">
							{getSentFiles.isLoading ? (
								<div className="flex items-center gap-2 text-muted-foreground">
									<SpinnerIcon className="w-4 h-4 animate-spin" />
									Loading...
								</div>
							) : (
								<pre className="text-xs whitespace-pre-wrap">
									{JSON.stringify(getSentFiles.data || [], null, 2)}
								</pre>
							)}
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<div className="flex items-center justify-between">
							<CardTitle className="text-lg">Received Files</CardTitle>
							<Button
								onClick={() => getReceivedFiles.refetch()}
								disabled={getReceivedFiles.isFetching}
								variant="outline"
								size="sm"
							>
								{getReceivedFiles.isFetching ? (
									<SpinnerIcon className="w-3 h-3 animate-spin mr-1" />
								) : (
									<DownloadIcon className="w-3 h-3 mr-1" />
								)}
								Refetch
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<div className="bg-muted/50 p-4 rounded-lg min-h-[100px]">
							{getReceivedFiles.isLoading ? (
								<div className="flex items-center gap-2 text-muted-foreground">
									<SpinnerIcon className="w-4 h-4 animate-spin" />
									Loading...
								</div>
							) : (
								<pre className="text-xs whitespace-pre-wrap">
									{JSON.stringify(getReceivedFiles.data || [], null, 2)}
								</pre>
							)}
						</div>
					</CardContent>
				</Card>
			</div>

			{/* File Details Display */}
			{fileDetails && (
				<Card>
					<CardHeader>
						<CardTitle className="text-lg">File Details</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="bg-muted/50 p-4 rounded-lg">
							<pre className="text-xs whitespace-pre-wrap">
								{JSON.stringify(fileDetails, null, 2)}
							</pre>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
