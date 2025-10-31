import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { isAddress, isHex, zeroAddress } from "viem";
import db from "../../../lib/db";
import { fsContracts } from "../../../lib/evm";
import { bucket } from "../../../lib/s3/client";
import { getOrCreateUserDataset } from "../../../lib/synapse";
import { respond } from "../../../lib/utils/respond";

const { FSFileRegistry } = fsContracts;

const { files, fileRecipients } = db.schema;
const MAX_FILE_SIZE = 30 * 1024 * 1024;

export default new Hono()
	.post("/upload/start", async (ctx) => {
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

	.post("/", async (ctx) => {
		const {
			sender,
			pieceCid,
			recipient,
			signature,
			kemCiphertext,
			timestamp,
			nonce,
		} = await ctx.req.json();

		if (typeof sender !== "string" || !isAddress(sender)) {
			return respond.err(ctx, "Invalid sender address", 400);
		}
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
		if (!recipient || typeof recipient !== "string" || !isAddress(recipient)) {
			return respond.err(ctx, "Invalid recipient address", 400);
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

		const insertResult = await db.transaction(async (tx) => {
			const [insertResult] = await tx
				.insert(files)
				.values({
					pieceCid,
					status: "s3",
					kemCiphertext,
					sender,
					onchainTxHash: txHash,
				})
				.returning();
			// TODO : Chcek using db if valid recipient
			await tx.insert(fileRecipients).values({
				filePieceCid: pieceCid,
				recipientWallet: recipient,
			});

			return insertResult;
		});

		const actualSize = bytes.byteLength;

		const ds = await getOrCreateUserDataset(sender);

		const preflight = await ds.preflightUpload(Math.floor(actualSize));

		if (!preflight.allowanceCheck.sufficient) {
			return respond.err(
				ctx,
				"Insufficient storage allowance, complain to the devs",
				402,
			);
		}

		ds.upload(bytes).then((uploadResult) => {
			file.delete();

			if (uploadResult.pieceCid.toString() !== pieceCid) {
				db.delete(files).where(eq(files.pieceCid, pieceCid));
			}

			db.update(files)
				.set({ status: "foc" })
				.where(eq(files.pieceCid, pieceCid))
				.catch((_) => {
					db.delete(files).where(eq(files.pieceCid, pieceCid));
				});
		});

		return respond.ok(ctx, {}, "File uploaded to filecoin warmstorage", 201);
	});
