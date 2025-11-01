import { useFileInfo, useSendFile, useViewFile } from "@filosign/react/hooks";
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

export function FileTest() {
	// New file hooks
	const sendFile = useSendFile();
	const [pieceCidForInfo, setPieceCidForInfo] = useState<string | undefined>(undefined);
	const fileInfo = useFileInfo({ pieceCid: pieceCidForInfo });
	const viewFile = useViewFile();

	const queryClient = useQueryClient();

	// Input states
	const [fileToUpload, setFileToUpload] = useState<File | null>(null);
	const [recipientAddress, setRecipientAddress] = useState("");
	const [recipientEncryptionKey, setRecipientEncryptionKey] = useState("");
	const [pieceCidToView, setPieceCidToView] = useState("");
	const [kemCiphertext, setKemCiphertext] = useState("");
	const [fileStatus, setFileStatus] = useState<"s3" | "foc">("s3");

	// File data state
	const [downloadedFile, setDownloadedFile] = useState<Uint8Array | null>(null);

	const handleFileUpload = async () => {
		if (!fileToUpload || !recipientAddress.trim() || !recipientEncryptionKey.trim()) return;

		try {
			const fileData = new Uint8Array(await fileToUpload.arrayBuffer());

			await sendFile.mutateAsync({
				recipient: {
					address: recipientAddress as `0x${string}`,
					encryptionPublicKey: recipientEncryptionKey,
				},
				data: fileData,
			});

			console.log("File uploaded successfully");
			setFileToUpload(null);
			setRecipientAddress("");
			setRecipientEncryptionKey("");
		} catch (error) {
			console.error("Failed to upload file", error);
		}
	};

	const handleViewFileDetails = () => {
		if (!pieceCidToView.trim()) return;
		setPieceCidForInfo(pieceCidToView);
	};

	const handleDownloadFile = async () => {
		if (!pieceCidToView.trim() || !kemCiphertext.trim()) return;

		try {
			const fileData = await viewFile.mutateAsync({
				pieceCid: pieceCidToView,
				kemCiphertext: kemCiphertext,
				status: fileStatus,
			});
			setDownloadedFile(fileData);
			console.log("File downloaded successfully");
		} catch (error) {
			console.error("Failed to download file", error);
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
				{/* Send File */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<UploadIcon className="w-5 h-5" />
							Send File
						</CardTitle>
						<CardDescription>
							Upload and encrypt a file to send to a recipient
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
								<Label htmlFor="recipient-address">Recipient Address</Label>
								<Input
									id="recipient-address"
									placeholder="0x..."
									value={recipientAddress}
									onChange={(e) => setRecipientAddress(e.target.value)}
								/>
							</div>
							<div>
								<Label htmlFor="recipient-encryption-key">Recipient Encryption Public Key</Label>
								<Input
									id="recipient-encryption-key"
									placeholder="Enter recipient's encryption public key..."
									value={recipientEncryptionKey}
									onChange={(e) => setRecipientEncryptionKey(e.target.value)}
								/>
							</div>
							<Button
								onClick={handleFileUpload}
								disabled={
									!fileToUpload ||
									!recipientAddress.trim() ||
									!recipientEncryptionKey.trim() ||
									sendFile.isPending
								}
								className="w-full"
								size="lg"
							>
								{sendFile.isPending ? (
									<SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
								) : (
									<UploadIcon className="w-4 h-4 mr-2" />
								)}
								Send File
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Get File Info */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<EyeIcon className="w-5 h-5" />
							Get File Info
						</CardTitle>
						<CardDescription>
							Get metadata and information about a file by its piece CID
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div>
								<Label htmlFor="piece-cid-info">Piece CID</Label>
								<Input
									id="piece-cid-info"
									placeholder="Enter piece CID..."
									value={pieceCidToView}
									onChange={(e) => setPieceCidToView(e.target.value)}
								/>
							</div>
							<Button
								onClick={handleViewFileDetails}
								disabled={!pieceCidToView.trim()}
								className="w-full"
								size="lg"
							>
								<EyeIcon className="w-4 h-4 mr-2" />
								Get File Info
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Download File */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<DownloadIcon className="w-5 h-5" />
						Download File
					</CardTitle>
					<CardDescription>
						Download and decrypt file content using the piece CID and KEM ciphertext
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-4 md:grid-cols-3">
						<div>
							<Label htmlFor="piece-cid-download">Piece CID</Label>
							<Input
								id="piece-cid-download"
								placeholder="Enter piece CID..."
								value={pieceCidToView}
								onChange={(e) => setPieceCidToView(e.target.value)}
							/>
						</div>
						<div>
							<Label htmlFor="kem-ciphertext">KEM Ciphertext</Label>
							<Input
								id="kem-ciphertext"
								placeholder="Enter KEM ciphertext..."
								value={kemCiphertext}
								onChange={(e) => setKemCiphertext(e.target.value)}
							/>
						</div>
						<div>
							<Label htmlFor="file-status">Storage Status</Label>
							<select
								id="file-status"
								value={fileStatus}
								onChange={(e) => setFileStatus(e.target.value as "s3" | "foc")}
								className="w-full px-3 py-2 border border-input bg-background rounded-md"
							>
								<option value="s3">S3 Storage</option>
								<option value="foc">Filecoin</option>
							</select>
						</div>
					</div>
					<Button
						onClick={handleDownloadFile}
						disabled={
							!pieceCidToView.trim() ||
							!kemCiphertext.trim() ||
							viewFile.isPending
						}
						size="lg"
					>
						{viewFile.isPending ? (
							<SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
						) : (
							<DownloadIcon className="w-4 h-4 mr-2" />
						)}
						Download File
					</Button>
				</CardContent>
			</Card>

			{/* File Info Display */}
			{fileInfo.data && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<FileTextIcon className="w-5 h-5" />
							File Information
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="bg-muted/50 p-4 rounded-lg">
							{fileInfo.isLoading ? (
								<div className="flex items-center gap-2 text-muted-foreground">
									<SpinnerIcon className="w-4 h-4 animate-spin" />
									Loading file info...
								</div>
							) : fileInfo.error ? (
								<div className="text-red-600">
									Error loading file info: {fileInfo.error.message}
								</div>
							) : (
								<pre className="text-xs whitespace-pre-wrap">
									{JSON.stringify(fileInfo.data, null, 2)}
								</pre>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Downloaded File Display */}
			{downloadedFile && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg">
							<FileIcon className="w-5 h-5" />
							Downloaded File
						</CardTitle>
						<CardDescription>
							File has been downloaded and decrypted ({downloadedFile.length} bytes)
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="bg-muted/50 p-4 rounded-lg">
							<div className="flex gap-2 mb-4">
								<Button
									size="sm"
									onClick={() => {
										const blob = new Blob([downloadedFile] as any);
										const url = URL.createObjectURL(blob);
										const a = document.createElement('a');
										a.href = url;
										a.download = 'downloaded-file';
										document.body.appendChild(a);
										a.click();
										document.body.removeChild(a);
										URL.revokeObjectURL(url);
									}}
								>
									<DownloadIcon className="w-4 h-4 mr-2" />
									Download File
								</Button>
								<Button
									size="sm"
									variant="outline"
									onClick={() => {
										const text = new TextDecoder().decode(downloadedFile);
										console.log('File content:', text);
										alert('File content logged to console');
									}}
								>
									<EyeIcon className="w-4 h-4 mr-2" />
									View Content
								</Button>
							</div>
							<div className="text-sm text-muted-foreground">
								File size: {downloadedFile.length} bytes
							</div>
							{downloadedFile.length < 1000 && (
								<div className="mt-2">
									<strong>Preview (first 1000 chars):</strong>
									<pre className="text-xs mt-1 whitespace-pre-wrap bg-background p-2 rounded border overflow-auto max-h-40">
										{new TextDecoder().decode(downloadedFile.slice(0, 1000))}
									</pre>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
