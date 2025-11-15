import { and, desc, eq, or } from "drizzle-orm";
import { Hono } from "hono";
import { isAddress } from "viem";
import db from "../../../lib/db";
import { bucket } from "../../../lib/s3/client";
import { respond } from "../../../lib/utils/respond";
import { authenticated } from "../../middleware/auth";

const { users } = db.schema;

export default new Hono()
	.get("/", authenticated, async (ctx) => {
		const wallet = ctx.var.userWallet;
		const [userData] = await db
			.select({
				walletAddress: users.walletAddress,
				keygenData: users.keygenDataJson,
				createdAt: users.createdAt,
				email: users.email,
				username: users.username,
				firstName: users.firstName,
				lastName: users.lastName,
				avatarKey: users.avatarKey,
			})
			.from(users)
			.where(eq(users.walletAddress, wallet));

		if (!userData) {
			return respond.err(ctx, "User not found", 404);
		}

		let avatarUrl: string | null = null;
		if (userData.avatarKey) {
			avatarUrl = bucket.presign(userData.avatarKey, {
				method: "GET",
				expiresIn: 60 * 60 * 24, // 1 day
			});
		}

		return respond.ok(
			ctx,
			{ ...userData, avatarUrl },
			"User data retrieved",
			200,
		);
	})

	.put("/", authenticated, async (ctx) => {
		const wallet = ctx.var.userWallet;
		const {
			email: emailRaw,
			username: usernameRaw,
			firstName: firstNameRaw,
			lastName: lastNameRaw,
		} = await ctx.req.json();

		if (emailRaw !== undefined) {
			if (typeof emailRaw !== "string" || !emailRaw.includes("@")) {
				return respond.err(ctx, "Invalid email format", 400);
			}
		}
		if (usernameRaw !== undefined) {
			if (
				typeof usernameRaw !== "string" ||
				usernameRaw.trim().length < 3 ||
				usernameRaw.length > 16
			) {
				return respond.err(
					ctx,
					"Username must be between 3 and 16 characters",
					400,
				);
			}
		}
		if (firstNameRaw !== undefined) {
			if (
				typeof firstNameRaw !== "string" ||
				firstNameRaw.trim().length < 1 ||
				firstNameRaw.length > 50
			) {
				return respond.err(
					ctx,
					"First name must be between 1 and 50 characters",
					400,
				);
			}
		}
		if (lastNameRaw !== undefined) {
			if (
				typeof lastNameRaw !== "string" ||
				lastNameRaw.trim().length < 1 ||
				lastNameRaw.length > 50
			) {
				return respond.err(
					ctx,
					"Last name must be between 1 and 50 characters",
					400,
				);
			}
		}

		const email = emailRaw?.trim();
		const username = usernameRaw?.trim();
		const firstName = firstNameRaw?.trim();
		const lastName = lastNameRaw?.trim();

		const [previous] = await db
			.select()
			.from(users)
			.where(eq(users.walletAddress, wallet));

		if (!previous) {
			return respond.err(ctx, "User not found", 404);
		}

		await db
			.update(users)
			.set({
				email: email ?? users.email,
				username: username ?? users.username,
				firstName: firstName ?? users.firstName,
				lastName: lastName ?? users.lastName,
			})
			.where(eq(users.walletAddress, wallet));

		if (previous.email !== email) {
			``;
		}

		return respond.ok(ctx, {}, "Profile updated successfully", 200);
	})

	.put("/avatar", authenticated, async (ctx) => {
		const wallet = ctx.var.userWallet;

		const formData = await ctx.req.formData();
		const file = formData.get("avatar") as File;

		if (!file) {
			return respond.err(ctx, "No avatar file provided", 400);
		}

		if (file.size > 32 * 1024) {
			return respond.err(ctx, "Avatar file must be 32KB or smaller", 400);
		}

		if (file.type !== "image/webp") {
			return respond.err(ctx, "Avatar must be a WebP image", 400);
		}

		const buffer = await file.arrayBuffer();

		const key = `avatars/${wallet}.webp`;
		await bucket.write(key, buffer, {
			type: "image/webp",
			acl: "public-read",
		});

		await db
			.update(users)
			.set({ avatarKey: key })
			.where(eq(users.walletAddress, wallet));

		return respond.ok(
			ctx,
			{ avatarKey: key },
			"Avatar uploaded successfully",
			200,
		);
	})

	.get("/prevalidate", authenticated, async (ctx) => {
		const { email, username } = ctx.req.query();

		if (email) {
			const [existingByEmail] = await db
				.select()
				.from(users)
				.where(eq(users.email, email as string));

			if (existingByEmail) {
				return respond.ok(ctx, { valid: false }, "Email already in use", 200);
			}
		}

		if (username) {
			const [existingByUsername] = await db
				.select()
				.from(users)
				.where(eq(users.username, username as string));
			if (existingByUsername) {
				return respond.ok(
					ctx,
					{ valid: false },
					"Username already in use",
					200,
				);
			}
		}

		return respond.ok(ctx, { valid: true }, "Valid for update", 200);
	})

	.get("/:q", authenticated, async (ctx) => {
		const q = ctx.req.param("q");
		const user = ctx.var.userWallet;

		const returns = {
			walletAddress: users.walletAddress,
			encryptionPublicKey: users.encryptionPublicKey,
			lastActiveAt: users.lastActiveAt,
			createdAt: users.createdAt,
			firstName: users.firstName,
			lastName: users.lastName,
			avatarKey: users.avatarKey,
		};

		let [userData] = await db
			.select(returns)
			.from(users)
			.where(eq(users.email, q));
		if (!userData && isAddress(q)) {
			[userData] = await db
				.select(returns)
				.from(users)
				.where(eq(users.walletAddress, q));
		}

		if (!userData) {
			return respond.err(ctx, "User not found", 404);
		}

		const isApproved = await db.canSendTo({
			sender: user,
			recipient: userData.walletAddress,
		});

		let avatarUrl: string | null = null;
		if (userData.avatarKey) {
			avatarUrl = bucket.presign(userData.avatarKey as string, {
				method: "GET",
				expiresIn: 60 * 60 * 24, // 1 day
			});
		}

		return respond.ok(
			ctx,
			{ ...userData, avatarUrl, isApproved },
			"User data retrieved",
			200,
		);
	});
