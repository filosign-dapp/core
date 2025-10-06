import { Hono } from "hono";
import profile from "./profile";
import signatures from "./signatures";
import { respond } from "../../../lib/utils/respond";
import db from "../../../lib/db";
import { eq } from "drizzle-orm";
import { isAddress } from "viem";

const { users } = db.schema;

export default new Hono()
  .route("/profile", profile)
  .route("/signatures", signatures)

  .get("/public-key", async (ctx) => {
    const walletAddress = ctx.req.query("address");

    if (typeof walletAddress !== "string" || !isAddress(walletAddress)) {
      return respond.err(
        ctx,
        "Address query param is required and must be a valid address",
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
