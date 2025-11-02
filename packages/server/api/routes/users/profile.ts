import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { isAddress } from "viem";
import db from "../../../lib/db";
import { respond } from "../../../lib/utils/respond";
import { authenticated } from "../../middleware/auth";

const { users } = db.schema;

export default new Hono().

    get("/", authenticated, async (ctx) => {
        const wallet = ctx.var.userWallet;
        const [userData] = await db
            .select({
                walletAddress: users.walletAddress,
                keygenData: users.keygenDataJson,
                createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.walletAddress, wallet));

        if (!userData) {
            return respond.err(ctx, "User not found", 404);
        }

        return respond.ok(ctx, userData, "User data retrieved", 200);
    })

    .put("/", authenticated, async (ctx) => {
        const wallet = ctx.var.userWallet;
        const body = await ctx.req.json();

        const updates: Partial<typeof users.$inferInsert> = {};

        if (body.email !== undefined) {
            if (typeof body.email !== "string" || !body.email.includes("@")) {
                return respond.err(ctx, "Invalid email format", 400);
            }
            updates.email = body.email;
        }
        if (body.username !== undefined) {
            if (typeof body.username !== "string" || body.username.length < 3 || body.username.length > 16) {
                return respond.err(ctx, "Username must be between 3 and 16 characters", 400);
            }
            updates.username = body.username;
        }
        if (body.avatarUrl !== undefined) {
            if (typeof body.avatarUrl !== "string") {
                return respond.err(ctx, "Invalid avatar URL", 400);
            }
            updates.avatarUrl = body.avatarUrl;
        }

        await db
            .update(users)
            .set(updates)
            .where(eq(users.walletAddress, wallet));

        return respond.ok(ctx, {}, "Profile updated successfully", 200);
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
                return respond.ok(ctx, { valid: false }, "Username already in use", 200);
            }
        }

        return respond.ok(ctx, { valid: true }, "Valid for update", 200);

    })

    .get("/:address", authenticated, async (ctx) => {
        const wallet = ctx.req.param("address");

        if (!isAddress(wallet)) {
            return respond.err(ctx, "Invalid wallet address", 400);
        }

        const [userData] = await db
            .select({
                walletAddress: users.walletAddress,
                encryptionPublicKey: users.encryptionPublicKey,
                lastActiveAt: users.lastActiveAt,
                // createdAt: users.createdAt,
            })
            .from(users)
            .where(eq(users.walletAddress, wallet));

        if (!userData) {
            return respond.err(ctx, "User not found", 404);
        }

        return respond.ok(ctx, userData, "User data retrieved", 200);
    });
