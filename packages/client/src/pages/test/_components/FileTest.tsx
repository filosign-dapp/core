import { useAckFile, useFileInfo, useSendFile, useSignFile, useViewFile } from "@filosign/react/hooks";
import {
	CheckCircleIcon,
	DownloadIcon,
	EyeIcon,
	FileIcon,
	FileTextIcon,
	SignatureIcon,
	SpinnerIcon,
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

export function FileTest() {
	// New file hooks
	const sendFile = useSendFile();
	const [pieceCidForInfo, setPieceCidForInfo] = useState<string | undefined>(undefined);
	const fileInfo = useFileInfo({ pieceCid: pieceCidForInfo });
	const viewFile = useViewFile();
	const ackFile = useAckFile();
	const signFile = useSignFile();

	// Input states
	const [fileToUpload, setFileToUpload] = useState<File | null>(null);
	const [recipientAddress, setRecipientAddress] = useState("");
	const [recipientEncryptionKey, setRecipientEncryptionKey] = useState("");
	const [pieceCidToView, setPieceCidToView] = useState("");
	const [kemCiphertext, setKemCiphertext] = useState("");
	const [fileStatus, setFileStatus] = useState<"s3" | "foc">("s3");
	const [pieceCidToAck, setPieceCidToAck] = useState("");
	const [pieceCidToSign, setPieceCidToSign] = useState("");
	const [signatureBytes, setSignatureBytes] = useState("");
	const [encryptedEncryptionKey, setEncryptedEncryptionKey] = useState("");
	const [signaturePosition, setSignaturePosition] = useState({ top: 0, left: 0 });

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
				bytes: fileData,
				signaturePositionOffset: signaturePosition,
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
		if (!pieceCidToView.trim() || !kemCiphertext.trim() || !encryptedEncryptionKey.trim()) return;

		try {
			const fileData = await viewFile.mutateAsync({
				pieceCid: pieceCidToView,
				kemCiphertext: kemCiphertext,
				encryptedEncryptionKey: encryptedEncryptionKey,
				status: fileStatus,
			});
			setDownloadedFile(fileData);
			console.log("File downloaded successfully");
		} catch (error) {
			console.error("Failed to download file", error);
		}
	};

	const handleAckFile = async () => {
		if (!pieceCidToAck.trim()) return;

		try {
			await ackFile.mutateAsync({
				pieceCid: pieceCidToAck,
			});
			console.log("File acknowledged successfully");
			setPieceCidToAck("");
		} catch (error) {
			console.error("Failed to acknowledge file", error);
		}
	};

	const handleSignFile = async () => {
		if (!pieceCidToSign.trim() || !signatureBytes.trim()) return;

		try {
			// Convert hex string to Uint8Array for signing
			const signatureBytesArray = new Uint8Array(signatureBytes.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []);

			await signFile.mutateAsync({
				pieceCid: pieceCidToSign,
				signatureBytes: signatureBytesArray,
			});
			console.log("File signed successfully");
			setPieceCidToSign("");
			setSignatureBytes("");
		} catch (error) {
			console.error("Failed to sign file", error);
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
			<div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
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

				{/* Acknowledge File */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CheckCircleIcon className="w-5 h-5" />
							Acknowledge File
						</CardTitle>
						<CardDescription>
							Acknowledge receipt of a file sent to you
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div>
								<Label htmlFor="piece-cid-ack">Piece CID</Label>
								<Input
									id="piece-cid-ack"
									placeholder="Enter piece CID to acknowledge..."
									value={pieceCidToAck}
									onChange={(e) => setPieceCidToAck(e.target.value)}
								/>
							</div>
							<Button
								onClick={handleAckFile}
								disabled={!pieceCidToAck.trim() || ackFile.isPending}
								className="w-full"
								size="lg"
							>
								{ackFile.isPending ? (
									<SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
								) : (
									<CheckCircleIcon className="w-4 h-4 mr-2" />
								)}
								Acknowledge File
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Sign File */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<SignatureIcon className="w-5 h-5" />
							Sign File
						</CardTitle>
						<CardDescription>
							Sign a file you've received with your cryptographic signature
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-3">
							<div>
								<Label htmlFor="piece-cid-sign">Piece CID</Label>
								<Input
									id="piece-cid-sign"
									placeholder="Enter piece CID to sign..."
									value={pieceCidToSign}
									onChange={(e) => setPieceCidToSign(e.target.value)}
								/>
							</div>
							<div>
								<Label htmlFor="signature-bytes">Signature Bytes (hex)</Label>
								<Input
									id="signature-bytes"
									placeholder="Enter signature bytes in hex format..."
									value={signatureBytes}
									onChange={(e) => setSignatureBytes(e.target.value)}
								/>
								<p className="text-xs text-muted-foreground mt-1">
									Enter your visual signature as hex bytes (e.g., from drawing or text)
								</p>
							</div>
							<Button
								onClick={handleSignFile}
								disabled={!pieceCidToSign.trim() || !signatureBytes.trim() || signFile.isPending}
								className="w-full"
								size="lg"
							>
								{signFile.isPending ? (
									<SpinnerIcon className="w-4 h-4 mr-2 animate-spin" />
								) : (
									<SignatureIcon className="w-4 h-4 mr-2" />
								)}
								Sign File
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
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
							<Label htmlFor="encrypted-encryption-key">Encrypted Encryption Key</Label>
							<Input
								id="encrypted-encryption-key"
								placeholder="Enter encrypted encryption key..."
								value={encryptedEncryptionKey}
								onChange={(e) => setEncryptedEncryptionKey(e.target.value)}
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
							!encryptedEncryptionKey.trim() ||
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
