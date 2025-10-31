// import { and, desc, eq, sql } from "drizzle-orm";
// import { Hono } from "hono";
// import {
// 	encodePacked,
// 	getAddress,
// 	isAddress,
// 	keccak256,
// 	verifyMessage,
// } from "viem";
// import db from "../../../lib/db";
// import { enqueueJob } from "../../../lib/jobrunner/scheduler";
// import { respond } from "../../../lib/utils/respond";
// import { authenticated } from "../../middleware/auth";

// const { shareRequests, shareApprovals } = db.schema;

// export default new Hono()
// 	.post("/request", authenticated, async (ctx) => {
// 		const { senderWallet, recipientWallet, message, signature } =
// 			await ctx.req.json();

// 		if (!recipientWallet || !isAddress(recipientWallet)) {
// 			return respond.err(ctx, "Invalid recipientWallet", 400);
// 		}

// 		const recipient = getAddress(recipientWallet);
// 		const sender = getAddress(senderWallet);

// 		if (recipient === sender) {
// 			return respond.err(ctx, "Don't ask yourself for permission", 400);
// 		}

// 		const newRequest = db
// 			.insert(shareRequests)
// 			.values({
// 				senderWallet: wallet,
// 				recipientWallet: recipient,
// 				message: message.toString().slice(0, 255),
// 				metadata: metadata,
// 			})
// 			.returning()
// 			.get();

// 		return respond.ok(ctx, newRequest, "Share request created", 201);
// 	})
// 	// .get("/received", authenticated, async (ctx) => {
// 	// 	const rows = db
// 	// 		.select()
// 	// 		.from(shareRequests)
// 	// 		.where(eq(shareRequests.recipientWallet, ctx.var.userWallet))
// 	// 		.orderBy(shareRequests.createdAt)
// 	// 		.all();

// 	// 	if (rows.length === 0) {
// 	// 		return respond.ok(ctx, { requests: [] }, "No received requests", 200);
// 	// 	}

// 	// 	// if status is not PENDING, remove from rows
// 	// 	const filteredRows = rows.filter((row) => row.status === "PENDING");

// 	// 	return respond.ok(
// 	// 		ctx,
// 	// 		{ requests: filteredRows },
// 	// 		"Received requests fetched",
// 	// 		200,
// 	// 	);
// 	// })
// 	// .get("/sent", authenticated, async (ctx) => {
// 	// 	const rows = db
// 	// 		.select()
// 	// 		.from(shareRequests)
// 	// 		.where(eq(shareRequests.senderWallet, ctx.var.userWallet))
// 	// 		.orderBy(shareRequests.createdAt)
// 	// 		.all();

// 	// 	return respond.ok(ctx, { requests: rows }, "Sent requests fetched", 200);
// 	// })
// 	.get("/can-send-to", authenticated, async (ctx) => {
// 		const subq = db
// 			.select({
// 				recipientWallet: shareApprovals.recipientWallet,
// 				maxCreatedAt: sql<number>`max(${shareApprovals.createdAt})`,
// 			})
// 			.from(shareApprovals)
// 			.where(eq(shareApprovals.senderWallet, ctx.var.userWallet))
// 			.groupBy(shareApprovals.recipientWallet)
// 			.as("subq");

// 		const rows = db
// 			.select({
// 				walletAddress: shareApprovals.recipientWallet,
// 				active: shareApprovals.active,
// 				createdAt: shareApprovals.createdAt,
// 			})
// 			.from(shareApprovals)
// 			.innerJoin(
// 				subq,
// 				and(
// 					eq(shareApprovals.recipientWallet, subq.recipientWallet),
// 					eq(shareApprovals.createdAt, subq.maxCreatedAt),
// 				),
// 			)
// 			.where(eq(shareApprovals.active, true))
// 			.execute();

// 		return respond.ok(
// 			ctx,
// 			{ people: rows },
// 			"People you can send requests to",
// 			200,
// 		);
// 	})
// 	.get("/can-receive-from", authenticated, async (ctx) => {
// 		const rows = db
// 			.select({
// 				walletAddress: shareApprovals.senderWallet,
// 				username: profiles.username,
// 				displayName: profiles.displayName,
// 				avatarUrl: profiles.avatarUrl,
// 				active: shareApprovals.active,
// 				createdAt: shareApprovals.createdAt,
// 			})
// 			.from(shareApprovals)
// 			.leftJoin(
// 				profiles,
// 				eq(shareApprovals.senderWallet, profiles.walletAddress),
// 			)
// 			.where(
// 				and(
// 					eq(shareApprovals.recipientWallet, ctx.var.userWallet),
// 					eq(shareApprovals.active, true),
// 				),
// 			)
// 			.orderBy(shareApprovals.createdAt)
// 			.all();

// 		return respond.ok(
// 			ctx,
// 			{ people: rows },
// 			"People who can send you requests",
// 			200,
// 		);
// 	})
// 	.delete("/:id/cancel", authenticated, async (ctx) => {
// 		const { id } = ctx.req.param();
// 		if (!id) return respond.err(ctx, "Missing id parameter", 400);

// 		const row = db
// 			.select()
// 			.from(shareRequests)
// 			.where(eq(shareRequests.id, id))
// 			.get();
// 		if (!row) return respond.err(ctx, "Request not found", 404);

// 		const sender = getAddress(row.senderWallet);
// 		if (sender !== ctx.var.userWallet) {
// 			return respond.err(ctx, "Only the sender may cancel this request", 403);
// 		}

// 		if (row.status !== "PENDING") {
// 			return respond.err(ctx, "Only pending requests can be cancelled", 409);
// 		}

// 		db.update(shareRequests)
// 			.set({
// 				status: "CANCELLED",
// 			})
// 			.where(eq(shareRequests.id, id))
// 			.run();

// 		void enqueueJob({
// 			type: "request:cancelled",
// 			payload: {
// 				requestId: id,
// 			},
// 		});

// 		return respond.ok(ctx, { canceled: id }, `Request ${id} canceled`, 200);
// 	});
