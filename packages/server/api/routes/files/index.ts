import {
	computeCommitment,
	hash as fsHash,
	signatures,
	toBytes,
} from "@filosign/crypto-utils/node";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { isAddress, isHex } from "viem";
import analytics from "../../../lib/analytics/logger";
import db from "../../../lib/db";
import { fsContracts } from "../../../lib/evm";
import { bucket } from "../../../lib/s3/client";
import { getOrCreateUserDataset } from "../../../lib/synapse";
import { respond } from "../../../lib/utils/respond";
import { authenticated } from "../../middleware/auth";

const { FSFileRegistry } = fsContracts;

const { files, fileRecipients, users } = db.schema;
const MAX_FILE_SIZE = 30 * 1024 * 1024;

export default new Hono()
	.post("/upload/start", authenticated, async (ctx) => {
		const { pieceCid } = await ctx.req.json();

		if (!pieceCid || typeof pieceCid !== "string") {
			return respond.err(ctx, "Invalid pieceCid", 400);
		}

		const key = `uploads/${pieceCid}`;

		const presignedUrl = bucket.presign(key, {
			method: "PUT",
			expiresIn: 60,
			type: "application/octet-stream",
			acl: "public-read",
		});

		return respond.ok(
			ctx,
			{ uploadUrl: presignedUrl, key },
			"Presigned URL generated",
			200,
		);
	})

	.post("/", authenticated, async (ctx) => {
		const sender = ctx.var.userWallet;
		const {
			pieceCid,
			recipient,
			signature,
			kemCiphertext,
			encryptedEncryptionKey,
			senderEncryptedEncryptionKey,
			senderKemCiphertext,
			timestamp,
			nonce,
		} = await ctx.req.json();

		if (typeof timestamp !== "number" || timestamp <= 0) {
			return respond.err(ctx, "Invalid timestamp", 400);
		}
		if (typeof nonce !== "number" || nonce < 0) {
			return respond.err(ctx, "Invalid nonce", 400);
		}
		if (!sender || typeof sender !== "string" || !isAddress(sender)) {
			return respond.err(ctx, "Invalid sender address", 400);
		}
		if (!signature || typeof signature !== "string" || !isHex(signature)) {
			return respond.err(ctx, "Invalid signature", 400);
		}
		if (!pieceCid || typeof pieceCid !== "string") {
			return respond.err(ctx, "Invalid pieceCid", 400);
		}
		if (typeof kemCiphertext !== "string" || !isHex(kemCiphertext)) {
			return respond.err(ctx, "Invalid kemCiphertext", 400);
		}
		if (
			!encryptedEncryptionKey ||
			typeof encryptedEncryptionKey !== "string" ||
			!isHex(encryptedEncryptionKey)
		) {
			return respond.err(ctx, "Invalid encryptedEncryptionKey", 400);
		}
		if (
			!senderEncryptedEncryptionKey ||
			typeof senderEncryptedEncryptionKey !== "string" ||
			!isHex(senderEncryptedEncryptionKey)
		) {
			return respond.err(ctx, "Invalid senderEncryptedEncryptionKey", 400);
		}
		if (!recipient || typeof recipient !== "string" || !isAddress(recipient)) {
			return respond.err(ctx, "Invalid recipient address", 400);
		}
		if (
			typeof senderKemCiphertext !== "string" ||
			!isHex(senderKemCiphertext)
		) {
			return respond.err(ctx, "Invalid senderKemCiphertext", 400);
		}

		const valid = await FSFileRegistry.read.validateFileRegistrationSignature([
			sender,
			pieceCid,
			recipient,
			BigInt(timestamp),
			BigInt(nonce),
			signature,
		]);

		if (!valid) {
			return respond.err(ctx, "Invalid signature", 400);
		}

		const fileExists = bucket.exists(`uploads/${pieceCid}`);
		if (!fileExists) {
			return respond.err(ctx, "File not found on storage", 400);
		}

		const file = bucket.file(`uploads/${pieceCid}`);
		if (file.size > MAX_FILE_SIZE) {
			file.delete();
			return respond.err(ctx, "File exceeds maximum allowed size", 413);
		}

		const bytes = await file.arrayBuffer();

		if (bytes.byteLength === 0) {
			file.delete();
			return respond.err(ctx, "Uploaded file is empty", 400);
		}

		const txHash = await FSFileRegistry.write.registerFile([
			sender,
			pieceCid,
			recipient,
			BigInt(timestamp),
			BigInt(nonce),
			signature,
		]);

		await db.transaction(async (tx) => {
			const [insertResult] = await tx
				.insert(files)
				.values({
					pieceCid,
					status: "s3",
					sender,
					senderEncryptedEncryptionKey,
					senderKemCiphertext,
					onchainTxHash: txHash,
				})
				.returning();
			// TODO : Chcek using db if valid recipient
			await tx.insert(fileRecipients).values({
				filePieceCid: pieceCid,
				recipientWallet: recipient,
				kemCiphertext: kemCiphertext,
				encryptedEncryptionKey: encryptedEncryptionKey,
			});

			return insertResult;
		});

		const actualSize = bytes.byteLength;

		const ds = await getOrCreateUserDataset(sender);

		const preflight = await ds.preflightUpload(Math.ceil(actualSize));

		if (!preflight.allowanceCheck.sufficient) {
			return respond.err(
				ctx,
				"Insufficient storage allowance, complain to the devs",
				402,
			);
		}

		ds.upload(bytes).then(async (uploadResult) => {
			await file.delete();

			if (uploadResult.pieceCid.toString() !== pieceCid) {
				await db.delete(files).where(eq(files.pieceCid, pieceCid));
			}

			await analytics.log("file uploaded to filecoin warmstorage", {
				pieceCid: pieceCid,
				sender: sender,
				recipient: recipient,
				size: actualSize,
				preflight: preflight,
				uploadResult: uploadResult,
			});

			await db
				.update(files)
				.set({ status: "foc" })
				.where(eq(files.pieceCid, pieceCid))
				.catch(async (_) => {
					await db.delete(files).where(eq(files.pieceCid, pieceCid));
				});
		});

		return respond.ok(ctx, {}, "File uploaded to filecoin warmstorage", 201);
	})

	.get("/:pieceCid", authenticated, async (ctx) => {
		const userWallet = ctx.var.userWallet;

		const pieceCid = ctx.req.param("pieceCid");
		if (!pieceCid || typeof pieceCid !== "string") {
			return respond.err(ctx, "Invalid pieceCid", 400);
		}

		const [fileRecord] = await db
			.select({
				pieceCid: files.pieceCid,
				sender: files.sender,
				status: files.status,
				onchainTxHash: files.onchainTxHash,
				senderEncryptedEncryptionKey: files.senderEncryptedEncryptionKey,
				senderKemCiphertext: files.senderKemCiphertext,
				createdAt: files.createdAt,
			})
			.from(files)
			.where(eq(files.pieceCid, pieceCid));
		const [fileRecipient] = await db
			.select({
				filePieceCid: fileRecipients.filePieceCid,
				recipientWallet: fileRecipients.recipientWallet,
				ack: fileRecipients.ack,
				kemCiphertext: fileRecipients.kemCiphertext,
				encryptedEncryptionKey: fileRecipients.encryptedEncryptionKey,
			})
			.from(fileRecipients)
			.where(eq(fileRecipients.filePieceCid, pieceCid));

		if (!fileRecord || !fileRecipient) {
			return respond.err(ctx, "File not found", 404);
		}

		const response = {
			...fileRecord,
			recipient: fileRecipient.recipientWallet,
			kemCiphertext: fileRecipient.ack ? fileRecipient.kemCiphertext : null,

			senderEncryptedEncryptionKey:
				userWallet === fileRecord.sender
					? fileRecord.senderEncryptedEncryptionKey
					: null,
			senderKemCiphertext:
				userWallet === fileRecord.sender
					? fileRecord.senderKemCiphertext
					: null,

			encryptedEncryptionKey:
				fileRecipient.ack && userWallet === fileRecipient.recipientWallet
					? fileRecipient.encryptedEncryptionKey
					: null,
		};

		return respond.ok(ctx, response, "File retrieved", 200);
	})

	.post("/:pieceCid/ack", async (ctx) => {
		const pieceCid = ctx.req.param("pieceCid");
		const { signature, timestamp } = await ctx.req.json();

		if (!pieceCid || typeof pieceCid !== "string") {
			return respond.err(ctx, "Invalid pieceCid", 400);
		}
		if (!signature || typeof signature !== "string" || !isHex(signature)) {
			return respond.err(ctx, "Invalid signature", 400);
		}
		if (typeof timestamp !== "number" || timestamp <= 0) {
			return respond.err(ctx, "Invalid timestamp", 400);
		}

		const [fileRecord] = await db
			.select({
				sender: files.sender,
			})
			.from(files)
			.where(eq(files.pieceCid, pieceCid));

		const [recipientRecord] = await db
			.select({
				wallet: fileRecipients.recipientWallet,
			})
			.from(fileRecipients)
			.where(eq(fileRecipients.filePieceCid, pieceCid));

		if (!recipientRecord) {
			return respond.err(ctx, "Recipient not found", 404);
		}

		const valid = await FSFileRegistry.read.validateFileAckSignature([
			recipientRecord.wallet,
			pieceCid,
			fileRecord.sender,
			BigInt(timestamp),
			signature,
		]);

		if (valid) {
			await db
				.update(fileRecipients)
				.set({ ack: signature })
				.where(eq(fileRecipients.filePieceCid, pieceCid));
			return respond.ok(ctx, {}, "File acknowledged successfully", 200);
		} else {
			return respond.err(ctx, "Invalid signature", 400);
		}
	})

	.post("/:pieceCid/sign", async (ctx) => {
		const pieceCid = ctx.req.param("pieceCid");
		const { signature, timestamp, signatureVisualBytes, dl3Signature } =
			await ctx.req.json();

		if (!pieceCid || typeof pieceCid !== "string") {
			return respond.err(ctx, "Invalid pieceCid", 400);
		}
		if (!signature || typeof signature !== "string" || !isHex(signature)) {
			return respond.err(ctx, "Invalid signature", 400);
		}
		if (typeof timestamp !== "number" || timestamp <= 0) {
			return respond.err(ctx, "Invalid timestamp", 400);
		}
		if (
			!signatureVisualBytes ||
			typeof signatureVisualBytes !== "string" ||
			!isHex(signatureVisualBytes)
		) {
			return respond.err(ctx, "Invalid signatureVisualBytes", 400);
		}
		if (
			!dl3Signature ||
			typeof dl3Signature !== "string" ||
			!isHex(dl3Signature)
		) {
			return respond.err(ctx, "Invalid dl3Signature", 400);
		}

		const [fileRecord] = await db
			.select({
				sender: files.sender,
			})
			.from(files)
			.where(eq(files.pieceCid, pieceCid));

		const [recipientRecord] = await db
			.select({
				wallet: fileRecipients.recipientWallet,
			})
			.from(fileRecipients)
			.where(eq(fileRecipients.filePieceCid, pieceCid));
		const [recipientUserRecord] = await db
			.select({
				signaturePublicKey: users.signaturePublicKey,
			})
			.from(users)
			.where(eq(users.walletAddress, recipientRecord.wallet));

		const userNonce = await FSFileRegistry.read.nonce([recipientRecord.wallet]);

		const signatureVisualHash = fsHash.digest(signatureVisualBytes);
		const dl3SignatureCommitment = computeCommitment([dl3Signature]);
		const message = [
			fileRecord.sender,
			pieceCid,
			recipientRecord.wallet,
			signatureVisualHash,
			dl3SignatureCommitment,
			BigInt(timestamp),
			BigInt(userNonce),
			signature,
		] as const;

		const dilithium = await signatures.dilithiumInstance();
		const isDl3SignatureValid = signatures.verify({
			dl: dilithium,
			message: toBytes(computeCommitment(message)),
			signature: toBytes(dl3Signature),
			publicKey: toBytes(recipientUserRecord.signaturePublicKey),
		});
		if (!isDl3SignatureValid) {
			return respond.err(ctx, "Invalid DL3 signature", 400);
		}

		const valid =
			await FSFileRegistry.read.validateFileSigningSignature(message);

		if (valid) {
			await db
				.update(fileRecipients)
				.set({ ack: signature })
				.where(eq(fileRecipients.filePieceCid, pieceCid));
		} else {
			return respond.err(ctx, "Invalid signature", 400);
		}
	})

	.get("/:pieceCid/s3", authenticated, async (ctx) => {
		const pieceCid = ctx.req.param("pieceCid");
		const userWallet = ctx.get("userWallet");

		if (!pieceCid || typeof pieceCid !== "string") {
			return respond.err(ctx, "Invalid pieceCid", 400);
		}

		// Check if user is authorized to access this file (sender or recipient)
		const [fileRecord] = await db
			.select({
				sender: files.sender,
			})
			.from(files)
			.where(eq(files.pieceCid, pieceCid));

		const [recipientRecord] = await db
			.select({
				recipientWallet: fileRecipients.recipientWallet,
			})
			.from(fileRecipients)
			.where(eq(fileRecipients.filePieceCid, pieceCid));

		if (!fileRecord || !recipientRecord) {
			return respond.err(ctx, "File not found", 404);
		}

		if (
			fileRecord.sender !== userWallet &&
			recipientRecord.recipientWallet !== userWallet
		) {
			return respond.err(ctx, "Unauthorized to access this file", 403);
		}

		const fileExists = bucket.exists(`uploads/${pieceCid}`);

		if (!fileExists) {
			return respond.err(ctx, "File not found on S3", 404);
		}

		const presignedUrl = bucket.presign(`uploads/${pieceCid}`, {
			method: "GET",
			expiresIn: 60 * 5, // 5 minutes
		});

		return respond.ok(ctx, { presignedUrl }, "Presigned URL retrieved", 200);
	})

	.get("/sent", authenticated, async (ctx) => {
		const userWallet = ctx.var.userWallet;

		const sentFiles = await db
			.select({
				pieceCid: files.pieceCid,
				sender: files.sender,
				status: files.status,
			})
			.from(files)
			.where(eq(files.sender, userWallet));

		return respond.ok(ctx, { sentFiles }, "Sent files retrieved", 200);
	})

	.get("/received", authenticated, async (ctx) => {
		const userWallet = ctx.var.userWallet;

		const receivedFiles = await db
			.select({
				pieceCid: files.pieceCid,
				sender: files.sender,
				status: files.status,
			})
			.from(files)
			.innerJoin(
				fileRecipients,
				eq(files.pieceCid, fileRecipients.filePieceCid),
			)
			.where(eq(fileRecipients.recipientWallet, userWallet));

		return respond.ok(ctx, { receivedFiles }, "Received files retrieved", 200);
	});
