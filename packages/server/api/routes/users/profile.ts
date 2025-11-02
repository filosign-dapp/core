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
