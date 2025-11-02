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
                email: users.email,
                username: users.username,
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
        const { emailRaw, usernameRaw } = await ctx.req.json();

        if (emailRaw !== undefined) {
            if (typeof emailRaw !== "string" || !emailRaw.includes("@")) {
                return respond.err(ctx, "Invalid email format", 400);
            }
        }
        if (usernameRaw !== undefined) {
            if (typeof usernameRaw !== "string" || usernameRaw.trim().length < 3 || usernameRaw.length > 16) {
                return respond.err(ctx, "Username must be between 3 and 16 characters", 400);
            }
        }

        const email = emailRaw?.trim();
        const username = usernameRaw?.trim();

        await db
            .update(users)
            .set({
                email: email ?? users.email,
                username: username ?? users.username,
            })
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

    .get("/:q", authenticated, async (ctx) => {
        const q = ctx.req.param("q");

        const returns = {
            walletAddress: users.walletAddress,
            encryptionPublicKey: users.encryptionPublicKey,
            lastActiveAt: users.lastActiveAt,
            createdAt: users.createdAt
        }
        let userData: Record<string, unknown> | null = null;

        if (isAddress(q)) {
            const [dbResp] = await db
                .select(returns)
                .from(users)
                .where(eq(users.walletAddress, q));
            userData = dbResp;
        } else {
            const [dbResp] = await db
                .select(returns)
                .from(users)
                .where(eq(users.username, q));
            userData = dbResp;
        }

        if (!userData) {
            return respond.err(ctx, "User not found", 404);
        }

        return respond.ok(ctx, userData, "User data retrieved", 200);
    })
