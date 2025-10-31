import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { keccak256 } from "viem";
import { KB } from "../../../constants";
import db from "../../../lib/db";
import { bucket } from "../../../lib/s3/client";
import { respond } from "../../../lib/utils/respond";
import { authenticated } from "../../middleware/auth";

const { userSignatures } = db.schema;

export default new Hono()
	.post(
		"/",
		authenticated,
		bodyLimit({
			maxSize: 100 * KB,
			onError: (ctx) => respond.err(ctx, "Request body too large", 413),
		}),
		async (ctx) => {
			const body = await ctx.req.parseBody();
			const uploaded = body.file;
			const name = body.name;

			if (!uploaded) {
				return respond.err(ctx, "no file provided", 400);
			}
			if (!(uploaded instanceof File)) {
				return respond.err(ctx, "invalid file", 400);
			}
			if (uploaded.size > 50 * KB) {
				return respond.err(ctx, "file too large [<50KB]", 413);
			}
			if (typeof name !== "string" || name.length < 3 || name.length > 32) {
				return respond.err(ctx, "invalid name [3<len<32]", 400);
			}

			const bytes = await uploaded.bytes();

			const signatureVisualHash = keccak256(bytes);

			const key = `signatures/${signatureVisualHash}.png`;
			const file = bucket.file(key);
			await file.write(bytes);

			const dbEntry = db
				.insert(userSignatures)
				.values({
					name,
					visualHash: signatureVisualHash,
					storageBucketPath: key,
					walletAddress: ctx.var.userWallet,
				})
				.returning()
				.get();

			return respond.ok(ctx, dbEntry, "Signature uploaded successfully", 201);
		},
	)

	.get("/", authenticated, async (ctx) => {
		const wallet = ctx.var.userWallet;

		const signatures = db
			.select()
			.from(userSignatures)
			.where(eq(userSignatures.walletAddress, wallet))
			.all();

		return respond.ok(
			ctx,
			{ signatures },
			"Signatures retrieved successfully",
			200,
		);
	})

	.delete("/:id", authenticated, async (ctx) => {
		const { id } = ctx.req.param();
		const wallet = ctx.var.userWallet;

		const signature = db
			.select()
			.from(userSignatures)
			.where(eq(userSignatures.id, id))
			.get();

		if (!signature) {
			return respond.err(ctx, "Signature not found", 404);
		}

		if (signature.walletAddress !== wallet) {
			return respond.err(ctx, "Unauthorized", 403);
		}

		const file = bucket.file(signature.storageBucketPath);
		await file.delete();

		db.delete(userSignatures).where(eq(userSignatures.id, id)).run();

		return respond.ok(ctx, {}, "Signature deleted successfully", 200);
	});
