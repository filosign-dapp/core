import { Hono } from "hono";
import {
  Hash,
  isAddress,
  isHex,
  keccak256,
  verifyMessage,
  type Address,
} from "viem";
import { respond } from "../../../lib/utils/respond";
import { issueJwtToken } from "../../../lib/utils/jwt";
import db from "../../../lib/db";
import { eq } from "drizzle-orm";
import { MINUTE } from "../../../constants";
import { p256 } from "@noble/curves/p256";
import { p256VerifyWithXOnly } from "../../../lib/utils/crypto";

const nonces: Record<Address, { nonce: Hash; validTill: number }> = {};
const { users } = db.schema;

export default new Hono()

  .get("/nonce", async (ctx) => {
    const wallet = ctx.req.query("address");
    if (!wallet || !isAddress(wallet)) {
      return respond.err(ctx, "Missing wallet address", 400);
    }

    const nonce = keccak256(Uint8Array.from(Bun.randomUUIDv7()));
    nonces[wallet] = { nonce, validTill: Date.now() + 1 * MINUTE };

    return respond.ok(ctx, { nonce }, "nonce generated", 200);
  })

  .get("/verify", async (ctx) => {
    const address = ctx.req.query("address");
    const pubKey = ctx.req.query("pub_key");
    const signature = ctx.req.query("signature");

    if (!address || !isAddress(address)) {
      return respond.err(ctx, "Missing or invalid address", 400);
    }

    if (!pubKey || !isHex(pubKey)) {
      return respond.err(ctx, "Missing or invalid public key", 400);
    }

    console.log("signature", signature);

    if (!signature) {
      return respond.err(ctx, "Missing signature", 400);
    }

    if (!isHex(signature)) {
      return respond.err(ctx, "Invalid signature format", 400);
    }

    const msgData = nonces[address];
    delete nonces[address];

    if (!msgData || msgData.validTill < Date.now()) {
      return respond.err(ctx, "Message expired or not found", 400);
    }

    const { nonce } = msgData;

    console.log(signature, nonce, pubKey);
    const valid = p256VerifyWithXOnly(signature, nonce, pubKey);
    console.log("valid", valid);

    if (!valid) {
      return respond.err(ctx, "Invalid signature", 400);
    }

    console.log("pubKey", pubKey);

    const user = db
      .select()
      .from(users)
      .where(eq(users.encryptionPublicKey, pubKey))
      .get();

    if (!user) {
      return respond.err(ctx, "User not found", 404);
    }

    const token = issueJwtToken(user.walletAddress);
    return respond.ok(ctx, { valid, token }, "Signature verified", 200);
  });
