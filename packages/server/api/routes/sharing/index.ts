import { and, desc, eq, sql } from "drizzle-orm";
import { Hono } from "hono";
import { getAddress, isAddress } from "viem";
import db from "../../../lib/db";
import { respond } from "../../../lib/utils/respond";
import { authenticated } from "../../middleware/auth";

const { shareRequests, shareApprovals } = db.schema;

// Base hours for spam prevention: wait this^(cancelled_count) hours after cancelling
const REQUEST_SPAM_BASE_HOURS = 3;

export default new Hono()
	.post("/request", authenticated, async (ctx) => {
		const { recipientWallet, message } = await ctx.req.json();

		if (!recipientWallet || !isAddress(recipientWallet)) {
			return respond.err(ctx, "Invalid recipientWallet", 400);
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
			);

		if (existingRequest) {
			return respond.err(ctx, "A pending request already exists", 409);
		}

		const [latestApproval] = await db
			.select()
			.from(shareApprovals)
			.where(
				and(
					eq(shareApprovals.senderWallet, sender),
					eq(shareApprovals.recipientWallet, recipient),
				),
			)
			.orderBy(desc(shareApprovals.createdAt))
			.limit(1);

		if (latestApproval?.active) {
			return respond.err(ctx, "Already approved", 409);
		}

		// spam prevetion: count cancelsed requests
		const cancelledRequests = await db
			.select()
			.from(shareRequests)
			.where(
				and(
					eq(shareRequests.senderWallet, sender),
					eq(shareRequests.recipientWallet, recipient),
					eq(shareRequests.status, "CANCELLED"),
				),
			)
			.orderBy(desc(shareRequests.createdAt));

		if (cancelledRequests.length > 0) {
			const lastCancelled = cancelledRequests[0];
			const hoursSinceCancel =
				(Date.now() - Number(lastCancelled.createdAt)) / (1000 * 60 * 60);
			const requiredWaitHours =
				REQUEST_SPAM_BASE_HOURS ** cancelledRequests.length;

			if (hoursSinceCancel < requiredWaitHours) {
				const remainingHours = Math.ceil(requiredWaitHours - hoursSinceCancel);
				return respond.err(
					ctx,
					`Please wait ${remainingHours} more hours before sending another request (spam prevention)`,
					429,
				);
			}
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
	.post("/request/invite", authenticated, async (ctx) => {
		const { inviteeEmail } = await ctx.req.json();

		if (
			!inviteeEmail ||
			typeof inviteeEmail !== "string" ||
			!inviteeEmail.includes("@")
		) {
			return respond.err(ctx, "Invalid inviteeEmail", 400);
		}

		const [existingUser] = await db
			.select()
			.from(db.schema.users)
			.where(eq(db.schema.users.email, inviteeEmail));

		ctx.res.headers.set("Location", `/api/sharing/request`);

		if (existingUser) {
			return respond.ok(
				ctx,
				{ address: existingUser.walletAddress },
				"Email is alreadt registered on the platform, request by address instead",
				303,
			);
		}

		const [existingInvite] = await db
			.select()
			.from(db.schema.userInvites)
			.where(
				and(
					eq(db.schema.userInvites.sender, ctx.var.userWallet),
					eq(db.schema.userInvites.inviteeEmail, inviteeEmail),
				),
			);

		if (existingInvite) {
			return respond.err(
				ctx,
				"An invite to this email from you already exists",
				409,
			);
		}

		const [newInvite] = await db
			.insert(db.schema.userInvites)
			.values({
				sender: ctx.var.userWallet,
				inviteeEmail,
			})
			.returning();

		return respond.ok(ctx, newInvite, "Invite sent", 201);
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
			return respond.ok(
				ctx,
				{ canSend: false, reason: "Cannot send to yourself" },
				"Checked send capability",
				200,
			);
		}
		const [latestApproval] = await db
			.select()
			.from(shareApprovals)
			.where(
				and(
					eq(shareApprovals.senderWallet, sender),
					eq(shareApprovals.recipientWallet, recipientAddr),
				),
			)
			.orderBy(desc(shareApprovals.createdAt))
			.limit(1);
		const canSend = latestApproval ? latestApproval.active : false;
		return respond.ok(
			ctx,
			{ canSend, reason: canSend ? null : "No active approval" },
			"Checked send capability",
			200,
		);
	})
	.delete("/:id/cancel", authenticated, async (ctx) => {
		const id = ctx.req.param("id");
		const userWallet = ctx.var.userWallet;
		const [approval] = await db
			.select()
			.from(shareRequests)
			.where(
				and(
					eq(shareRequests.id, id),
					eq(shareRequests.senderWallet, userWallet),
					eq(shareRequests.status, "PENDING"),
				),
			);
		if (!approval) {
			return respond.err(ctx, "Approval not found or cannot cancel", 404);
		}
		await db
			.update(shareRequests)
			.set({ status: "CANCELLED" })
			.where(eq(shareRequests.id, id));
		return respond.ok(ctx, {}, "Request cancelled", 200);
	})
	.delete("/:id/reject", authenticated, async (ctx) => {
		const id = ctx.req.param("id");
		const userWallet = ctx.var.userWallet;
		const [approval] = await db
			.select()
			.from(shareRequests)
			.where(
				and(
					eq(shareRequests.id, id),
					eq(shareRequests.recipientWallet, userWallet),
					eq(shareRequests.status, "PENDING"),
				),
			);
		if (!approval) {
			return respond.err(ctx, "Request not found or cannot reject", 404);
		}
		await db
			.update(shareRequests)
			.set({ status: "REJECTED" })
			.where(eq(shareRequests.id, id));
		return respond.ok(ctx, {}, "Request rejected", 200);
	})
	.get("/receivable-from", authenticated, async (ctx) => {
		const userWallet = ctx.var.userWallet;

		const subquery = db
			.select({
				senderWallet: shareApprovals.senderWallet,
				maxCreatedAt: sql<Date>`max(${shareApprovals.createdAt})`,
			})
			.from(shareApprovals)
			.where(eq(shareApprovals.recipientWallet, userWallet))
			.groupBy(shareApprovals.senderWallet)
			.as("subquery");

		const approvals = await db
			.select({
				senderWallet: shareApprovals.senderWallet,
				active: shareApprovals.active,
				createdAt: shareApprovals.createdAt,
			})
			.from(shareApprovals)
			.innerJoin(
				subquery,
				and(
					eq(shareApprovals.senderWallet, subquery.senderWallet),
					eq(shareApprovals.createdAt, subquery.maxCreatedAt),
				),
			);

		return respond.ok(ctx, { approvals }, "Receivable from retrieved", 200);
	})
	.get("/sendable-to", authenticated, async (ctx) => {
		const userWallet = ctx.var.userWallet;

		const subquery = db
			.select({
				recipientWallet: shareApprovals.recipientWallet,
				maxCreatedAt: sql<Date>`max(${shareApprovals.createdAt})`,
			})
			.from(shareApprovals)
			.where(eq(shareApprovals.senderWallet, userWallet))
			.groupBy(shareApprovals.recipientWallet)
			.as("subquery");

		const approvals = await db
			.select({
				recipientWallet: shareApprovals.recipientWallet,
				active: shareApprovals.active,
				createdAt: shareApprovals.createdAt,
			})
			.from(shareApprovals)
			.innerJoin(
				subquery,
				and(
					eq(shareApprovals.recipientWallet, subquery.recipientWallet),
					eq(shareApprovals.createdAt, subquery.maxCreatedAt),
				),
			);

		return respond.ok(ctx, { approvals }, "Sendable to retrieved", 200);
	});
