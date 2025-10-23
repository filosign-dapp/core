import { computeCidIdentifier, parsePieceCid } from "@filosign/contracts";
import { calculate as calculatePieceCid } from "@filoz/synapse-sdk/piece";
import { toB64 } from "filosign-crypto-utils";
import type { Address } from "viem";
import { generatePrivateKey } from "viem/accounts";
import z from "zod";
import type { Defaults } from "../../types/client";
import type Logger from "./Logger";

const zFileProfile = z
	.object({
		username: z.string().nullable(),
		displayName: z.string().nullable(),
		avatarUrl: z.string().nullable(),
	})
	.nullable();

const zFileSignature = z.object({
	id: z.string(),
	signerWallet: z.string(),
	signatureVisualHash: z.string(),
	timestamp: z.number(),
	compactSignature: z.string(),
	onchainTxHash: z.string().nullable(),
	createdAt: z.number(),
	signerProfile: zFileProfile,
});

// const zFile = z.object({
// 	pieceCid: z.string(),
// 	ownerWallet: z.string(),
// 	status: z.enum(["s3", "foc", "unpaid_for", "invalid"]),
// 	recipientWallet: z.string().nullable(),
// 	metadata: z.record(z.string(), z.any()).nullable(),
// 	acknowledged: z.boolean(),
// 	onchainTxHash: z.string().nullable(),
// 	acknowledgedTxHash: z.string().nullable(),
// 	createdAt: z.number(),
// 	updatedAt: z.number(),
// 	signatures: z.array(zFileSignature),
// });

const zSentFile = z.object({
	pieceCid: z.string(),
	ownerWallet: z.string(),
	metadata: z.record(z.string(), z.any()).nullable(),
	status: z.enum(["s3", "foc", "unpaid_for", "invalid"]),
	onchainTxHash: z.string().nullable(),
	createdAt: z.number(),
	updatedAt: z.number(),
	recipients: z.array(
		z.object({
			recipientWallet: z.string(),
			acknowledged: z.boolean(),
			acknowledgedTxHash: z.string().nullable(),
			recipientProfile: zFileProfile,
		}),
	),
	signatures: z.array(zFileSignature),
});

const zReceivedFile = z.object({
	pieceCid: z.string(),
	ownerWallet: z.string(),
	recipientWallet: z.string().nullable(),
	metadata: z.record(z.string(), z.any()).nullable(),
	status: z.enum(["s3", "foc", "unpaid_for", "invalid"]), // Add this field
	acknowledged: z.boolean(),
	onchainTxHash: z.string().nullable(),
	acknowledgedTxHash: z.string().nullable(),
	createdAt: z.number(),
	updatedAt: z.number(),
	senderProfile: zFileProfile,
	signatures: z.array(zFileSignature),
});

const zPagination = z.object({
	page: z.number(),
	limit: z.number(),
	hasMore: z.boolean(),
});

export default class Files {
	private defaults: Defaults;
	private logger: Logger;

	constructor(defaults: Defaults) {
		this.defaults = defaults;
		this.logger = defaults.logger;

		this.logger.info("Files interface instantiated");
	}

	async getSentFiles(options?: { page?: number; limit?: number }) {
		const { apiClient } = this.defaults;
		apiClient.ensureJwt();

		const params = new URLSearchParams();
		if (options?.page) params.append("page", options.page.toString());
		if (options?.limit) params.append("limit", options.limit.toString());

		const queryString = params.toString();
		const url = `/files/sent${queryString ? `?${queryString}` : ""}`;

		const response = await apiClient.rpc.getSafe(
			{
				files: z.array(zSentFile),
				pagination: zPagination,
			},
			url,
		);
		return response;
	}

	async getReceivedFiles(options?: { page?: number; limit?: number }) {
		const { apiClient } = this.defaults;
		apiClient.ensureJwt();

		const params = new URLSearchParams();
		if (options?.page) params.append("page", options.page.toString());
		if (options?.limit) params.append("limit", options.limit.toString());

		const queryString = params.toString();
		const url = `/files/received${queryString ? `?${queryString}` : ""}`;

		const response = await apiClient.rpc.getSafe(
			{
				files: z.array(zReceivedFile),
				pagination: zPagination,
			},
			url,
		);
		return response;
	}

	async uploadFile(options: {
		data: Uint8Array;
		recipientAddresses: Address[];
		metadata?: Record<string, unknown>;
	}) {
		const { apiClient, crypto, tx, contracts, wallet } = this.defaults;

		try {
			apiClient.ensureJwt();
			const dataEncryptionKey = generatePrivateKey();

			const { encrypted: encryptedData, iv: dataIv } =
				await crypto.encryptWithKey(options.data, dataEncryptionKey);
			const encryptedDataIvHex = `0x${(dataIv).toHex()}`;

			const pieceCid = calculatePieceCid(new Uint8Array(encryptedData));

			const uploadStartResponse = await apiClient.rpc.postSafe(
				{
					uploadUrl: z.string(),
					key: z.string(),
				},
				"/files/upload/start",
				{
					pieceCid: pieceCid.toString(),
				},
			);

			const uploadResponse = await fetch(uploadStartResponse.data.uploadUrl, {
				method: "PUT",
				headers: {
					"Content-Type": "application/octet-stream",
				},
				body: encryptedData,
			});

			if (!uploadResponse.ok) {
				console.error("❌ S3 upload failed:", {
					status: uploadResponse.status,
					statusText: uploadResponse.statusText,
				});
				throw new Error(`Upload failed: ${uploadResponse.statusText}`);
			}

			const ownerWallet = wallet.account.address;

			const ownerPubKeyResponse = await apiClient.rpc.getSafe(
				{
					publicKey: z.string(),
				},
				`/user/public-key?address=${ownerWallet}`,
			);

			const ownerPubKeyHex = ownerPubKeyResponse.data.publicKey;
			const ownerPubKeyB64 = toB64(ownerPubKeyHex);

			const { encrypted: ownerEncryptedKeyBuffer, iv: ownerKeyIv } =
				await crypto.encrypt(
					Uint8Array.fromHex(dataEncryptionKey.replace("0x", "")),
					ownerPubKeyB64,
				);

			const ownerEncryptedKey = `0x${Buffer.from(ownerEncryptedKeyBuffer).toString("hex")}`;
			const ownerKeyIvBase64 = `0x${Buffer.from(ownerKeyIv).toString("hex")}`;

			const recipients = [];
			for (let i = 0; i < options.recipientAddresses.length; i++) {
				const recipientAddress = options.recipientAddresses[i];

				try {
					const recipientPubKeyResponse = await apiClient.rpc.getSafe(
						{
							publicKey: z.string(),
						},
						`/user/public-key?address=${recipientAddress}`,
					);

					const recipientPubKeyHex = recipientPubKeyResponse.data.publicKey;
					const recipientPubKeyB64 = toB64(recipientPubKeyHex);

					const { encrypted: encryptedKeyBuffer, iv: keyIv } =
						await crypto.encrypt(
							Uint8Array.fromHex(dataEncryptionKey.replace("0x", "")),
							recipientPubKeyB64,
						);

					const encryptedKey = `0x${Buffer.from(encryptedKeyBuffer).toString("hex")}`;
					const keyIvBase64 = `0x${Buffer.from(keyIv).toString("hex")}`;

					recipients.push({
						wallet: recipientAddress,
						encryptedKey,
						iv: keyIvBase64,
					});
				} catch (error) {
					console.error(
						`❌ Failed to process recipient ${recipientAddress}:`,
						error,
					);
					throw new Error(
						`Failed to encrypt key for recipient ${recipientAddress}: ${error}`,
					);
				}
			}
			const registerResponse = await apiClient.rpc.postSafe(
				{
					pieceCid: z.string(),
					ownerWallet: z.string(),
					metadata: z.record(z.string(), z.any()).nullable(),
					ownerEncryptedKey: z.string(),
					ownerEncryptedKeyIv: z.string(),
					createdAt: z.number(),
					updatedAt: z.number(),
				},
				"/files",
				{
					pieceCid: pieceCid.toString(),
					recipients,
					metaData: options.metadata || null,
					ownerEncryptedKey,
					ownerEncryptedKeyIv: ownerKeyIvBase64,
					encryptedDataIv: encryptedDataIvHex,
				},
			);

			const { digestPrefix, digestBuffer, digestTail } = parsePieceCid(
				pieceCid.toString(),
			);

			const receipt = await tx(
				contracts.FSFileRegistry.write.registerFile([
					digestPrefix,
					digestBuffer,
					digestTail,
					options.recipientAddresses,
				]),
			);

			const finalResult = {
				...registerResponse,
				onchainTxHash: receipt.transactionHash,
			};

			return finalResult;
		} catch (error) {
			console.error("💥 File upload failed:", {
				error: error instanceof Error ? error.message : error,
				stack: error instanceof Error ? error.stack : undefined,
				recipients: options.recipientAddresses,
			});
			throw error;
		}
	}

	async getFileDetails(options: { pieceCid: string }) {
		const { apiClient } = this.defaults;
		apiClient.ensureJwt();

		const response = await apiClient.rpc.getSafe(
			{
				pieceCid: z.string(),
				ownerWallet: z.string(),
				metadata: z.record(z.string(), z.any()).nullable(),
				status: z.enum(["s3", "foc", "unpaid_for", "invalid"]),
				userRole: z.enum(["owner", "recipient"]),
				userAcknowledged: z.boolean(),
				userAcknowledgedTxHash: z.string().nullable(),
				recipients: z.array(
					z.object({
						recipientWallet: z.string(),
						acknowledged: z.boolean(),
						acknowledgedTxHash: z.string().nullable(),
						acknowledgedAt: z.number().nullable(),
						recipientProfile: zFileProfile,
					}),
				),
				acknowledgmentSummary: z.object({
					total: z.number(),
					acknowledged: z.number(),
					pending: z.number(),
					allAcknowledged: z.boolean(),
				}),
				signatures: z.array(zFileSignature),
				ownerProfile: zFileProfile,
				onchainTxHash: z.string().nullable(),
				createdAt: z.number(),
				updatedAt: z.number(),
			},
			`/files/${options.pieceCid}`,
		);

		return response.data;
	}

	async acknowledgeFile(options: { pieceCid: string }) {
		const { tx, contracts } = this.defaults;

		const cidIdentifier = computeCidIdentifier(options.pieceCid);

		const receipt = await tx(
			contracts.FSFileRegistry.write.acknowledge([cidIdentifier]),
		);

		return {
			transactionHash: receipt.transactionHash,
			cidIdentifier,
			acknowledged: true,
		};
	}

	async viewFile(options: {
		pieceCid: string;
		encryptedFileData: Uint8Array;
	}): Promise<{
		data: Uint8Array;
		metadata?: Record<string, unknown>;
	}> {
		const { apiClient, crypto } = this.defaults;
		apiClient.ensureJwt();

		const fileInfo = await this.getFileDetails({ pieceCid: options.pieceCid });

		if (fileInfo.userRole === "recipient" && !fileInfo.userAcknowledged) {
			throw new Error("File must be acknowledged before viewing");
		}

		const keyResponse = await apiClient.rpc.getSafe(
			{
				encryptedKey: z.string(),
				encryptedKeyIv: z.string(),
				role: z.enum(["owner", "recipient"]),
			},
			`/files/${options.pieceCid}/key`,
		);

		const ownerPubKeyResponse = await apiClient.rpc.getSafe(
			{
				publicKey: z.string(),
			},
			`/user/public-key?address=${fileInfo.ownerWallet}`,
		);

		const encryptedKeyHex = keyResponse.data.encryptedKey;
		const encryptedKeyIvHex = keyResponse.data.encryptedKeyIv;

		const encryptedKeyBuffer = Buffer.from(
			encryptedKeyHex.replace("0x", ""),
			"hex",
		);
		const encryptedKeyIvBuffer = Buffer.from(
			encryptedKeyIvHex.replace("0x", ""),
			"hex",
		);

		const decryptedKeyBuffer = await crypto.decrypt(
			encryptedKeyBuffer,
			new Uint8Array(encryptedKeyIvBuffer),
			ownerPubKeyResponse.data.publicKey,
		);

		const decryptedData = await crypto.decryptWithKey(
			options.encryptedFileData,
			`0x${Buffer.from(decryptedKeyBuffer).toString("hex")}`,
		);

		return {
			data: decryptedData,
			metadata: fileInfo.metadata || undefined,
		};
	}
}
