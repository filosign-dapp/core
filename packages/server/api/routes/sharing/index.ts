import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { getAddress, isAddress, isHex } from "viem";
import db from "../../../lib/db";
import { respond } from "../../../lib/utils/respond";
import { authenticated } from "../../middleware/auth";

const { shareRequests, shareApprovals } = db.schema;

export default new Hono()
    .post("/request", authenticated, async (ctx) => {
        const { recipientWallet, message, signature } = await ctx.req.json();

        if (!recipientWallet || !isAddress(recipientWallet)) {
            return respond.err(ctx, "Invalid recipientWallet", 400);
        }
        if (!signature || typeof signature !== "string" || !isHex(signature)) {
            return respond.err(ctx, "Invalid signature", 400);
        }

        const recipient = getAddress(recipientWallet);
        const sender = ctx.var.userWallet;

        if (recipient === sender) {
            return respond.err(ctx, "Don't ask yourself for permission", 400);
        }

        const [existingRequest] = await db
            .select()
            .from(shareRequests)
            .where(
                and(
                    eq(shareRequests.senderWallet, sender),
                    eq(shareRequests.recipientWallet, recipient),
                    eq(shareRequests.status, "PENDING"),
                ),
            )

        if (existingRequest) {
            return respond.err(ctx, "A pending request already exists", 409);
        }

        const newRequest = db
            .insert(shareRequests)
            .values({
                senderWallet: sender,
                recipientWallet: recipient,
                message: message || null,
            })
            .returning({
                id: shareRequests.id,
                senderWallet: shareRequests.senderWallet,
                recipientWallet: shareRequests.recipientWallet,
                message: shareRequests.message,
                status: shareRequests.status,
                createdAt: shareRequests.createdAt,
            });

        return respond.ok(ctx, newRequest, "Share request created", 201);
    })
    .get("/received", authenticated, async (ctx) => {
        const userWallet = ctx.var.userWallet;
        const approvals = await db
            .select()
            .from(shareApprovals)
            .where(eq(shareApprovals.recipientWallet, userWallet))
            .orderBy(desc(shareApprovals.createdAt));
        return respond.ok(ctx, { approvals }, "Share approvals retrieved", 200);
    })
    .get("/can-send-to", authenticated, async (ctx) => {
        const { recipient } = ctx.req.query();
        if (!recipient || !isAddress(recipient)) {
            return respond.err(ctx, "Invalid recipient", 400);
        }
        const recipientAddr = getAddress(recipient);
        const sender = ctx.var.userWallet;
        if (recipientAddr === sender) {
            return respond.ok(ctx, { canSend: false, reason: "Cannot send to yourself" }, "Checked send capability", 200);
        }
        const [approval] = await db
            .select()
            .from(shareApprovals)
            .where(
                and(
                    eq(shareApprovals.senderWallet, sender),
                    eq(shareApprovals.recipientWallet, recipientAddr),
                    eq(shareApprovals.active, true),
                ),
            );
        return respond.ok(ctx, { canSend: !!approval, reason: approval ? null : "No active approval" }, "Checked send capability", 200);
    })
    .delete("/:id/cancel", authenticated, async (ctx) => {
        const id = ctx.req.param("id");
        const userWallet = ctx.var.userWallet;
        const [approval] = await db
            .select()
            .from(shareApprovals)
            .where(
                and(
                    eq(shareApprovals.id, id),
                    eq(shareApprovals.recipientWallet, userWallet),
                    eq(shareApprovals.active, true),
                ),
            );
        if (!approval) {
            return respond.err(ctx, "Approval not found or cannot cancel", 404);
        }
        await db
            .update(shareApprovals)
            .set({ active: false })
            .where(eq(shareApprovals.id, id));
        return respond.ok(ctx, {}, "Approval cancelled", 200);
    });
