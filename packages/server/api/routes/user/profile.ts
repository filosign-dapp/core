import { eq } from "drizzle-orm";
import { Hono } from "hono";
import db from "../../../lib/db";
import { respond } from "../../../lib/utils/respond";
import { authenticated } from "../../middleware/auth";

const { users, profiles } = db.schema;

export default new Hono()

	.get("/exists", authenticated, async (ctx) => {
		const wallet = ctx.var.userWallet;
		const profileExists = db
			.select()
			.from(profiles)
			.where(eq(profiles.walletAddress, wallet))
			.get();
		if (profileExists) {
			return respond.ok(ctx, { exists: true }, "Profile exists", 200);
		}
		return respond.ok(ctx, { exists: false }, "Profile does not exist", 200);
	})

	.get("/", authenticated, async (ctx) => {
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

	.get("/:username", authenticated, async (ctx) => {
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

	.post("/", authenticated, async (ctx) => {
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

	.put("/", authenticated, async (ctx) => {
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
