import { Hono } from "hono";
import { isAddress, isHex, keccak256, verifyMessage, type Address } from "viem";
import { respond } from "../../../lib/utils/respond";
import { issueJwtToken } from "../../../lib/utils/jwt";
import { authenticated } from "../../middleware/auth";
import db from "../../../lib/db";
import { eq } from "drizzle-orm";
import { MINUTE } from "../../../constants";
import { publicKeyToAddress } from "viem/utils";

const nonces: Record<Address, { nonce: string; validTill: number }> = {};
const { users, profiles } = db.schema;

export default new Hono()

  .get("/nonce", async (ctx) => {
    const wallet = ctx.req.query("wallet_address");
    if (!wallet || !isAddress(wallet)) {
      return respond.err(ctx, "Missing wallet address", 400);
    }

    const nonce = keccak256(Uint8Array.from(Bun.randomUUIDv7()));
    nonces[wallet] = { nonce, validTill: Date.now() + 1 * MINUTE };

    return respond.ok(ctx, { nonce }, "nonce generated", 200);
  })

  .get("/verify", async (ctx) => {
    const pubKey = ctx.req.query("pub_key");
    const signature = ctx.req.query("signature");

    if (!pubKey || !isHex(pubKey)) {
      return respond.err(ctx, "Missing or invalid public key", 400);
    }

    const address = publicKeyToAddress(pubKey);

    if (!signature || !isHex(signature)) {
      return respond.err(ctx, "Missing signature", 400);
    }

    const msgData = nonces[address];
    delete nonces[address];

    if (!msgData || msgData.validTill < Date.now()) {
      return respond.err(ctx, "Message expired or not found", 400);
    }

    const { nonce } = msgData;

    const valid = await verifyMessage({
      message: nonce,
      signature,
      address,
    });

    if (!valid) {
      return respond.err(ctx, "Invalid signature", 400);
    }

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
  })

  .get("/profile", authenticated, async (ctx) => {
    const wallet = ctx.var.userWallet;

    const userData = db
      .select({
        walletAddress: users.walletAddress,
        email: users.email,
        lastActiveAt: users.lastActiveAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        username: profiles.username,
        displayName: profiles.displayName,
        avatarUrl: profiles.avatarUrl,
        bio: profiles.bio,
        metadataJson: profiles.metadataJson,
      })
      .from(users)
      .leftJoin(profiles, eq(users.walletAddress, profiles.walletAddress))
      .where(eq(users.walletAddress, wallet))
      .get();

    if (!userData) {
      return respond.err(ctx, "User not found", 404);
    }

    return respond.ok(ctx, userData, "User data retrieved", 200);
  })

  .get("/profile/:username", authenticated, async (ctx) => {
    const { username } = ctx.req.param();

    const usernameAvailable = db
      .select()
      .from(profiles)
      .where(eq(profiles.username, username))
      .get();
    if (usernameAvailable) {
      return respond.ok(ctx, { available: false }, "Username unavailable", 200);
    }
    return respond.ok(ctx, { available: true }, "Username available", 200);
  })

  .post("/profile", authenticated, async (ctx) => {
    const wallet = ctx.var.userWallet;
    const { username, displayName } = await ctx.req.json();

    const existingUsername = db
      .select()
      .from(profiles)
      .where(eq(profiles.username, username))
      .get();
    if (existingUsername) {
      return respond.err(ctx, "Username already exists", 400);
    }

    const newProfile = db
      .insert(profiles)
      .values({
        walletAddress: wallet,
        username,
        displayName,
      })
      .returning()
      .get();

    return respond.ok(ctx, newProfile, "Profile created successfully", 201);
  })

  .put("/profile", authenticated, async (ctx) => {
    const wallet = ctx.var.userWallet;
    const { username, displayName, avatarUrl, bio, metadataJson } =
      await ctx.req.json();

    const existingProfile = db
      .select()
      .from(profiles)
      .where(eq(profiles.walletAddress, wallet))
      .get();

    if (!existingProfile) {
      return respond.err(ctx, "Profile not found", 404);
    }

    const updatedProfile = db
      .update(profiles)
      .set({
        username,
        displayName,
        avatarUrl,
        bio,
        metadataJson,
      })
      .where(eq(profiles.walletAddress, wallet))
      .returning()
      .get();

    return respond.ok(ctx, updatedProfile, "Profile updated successfully", 200);
  });
