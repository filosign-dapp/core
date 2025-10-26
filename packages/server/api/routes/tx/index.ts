import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { isAddress, isHash } from "viem";
import db from "../../../lib/db";
import { respond } from "../../../lib/utils/respond";

const { users } = db.schema;

export default new Hono().post("/:hash", async (ctx) => {
	const txHash = ctx.req.param("hash");

	if (typeof txHash !== "string" || !isHash(txHash)) {
		return respond.err(
			ctx,
			"Transaction hash param is required and must be a valid hash",
			400,
		);
	}

	const user = db
		.select()
		.from(users)
		.where(eq(users.walletAddress, walletAddress))
		.get();
	if (!user) {
		return respond.err(ctx, "User not found", 404);
	}

	return respond.ok(
		ctx,
		{ publicKey: user.encryptionPublicKey },
		"Encryption public key retrieved successfully",
		200,
	);
});
