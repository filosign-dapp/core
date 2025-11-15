import { and, desc, eq } from "drizzle-orm";
import type { Address } from "viem";
import type dbClient from "./client";
import schema from "./schema";

type DbClient = typeof dbClient;

export function dbExtensionHelpers(db: DbClient) {
	async function canSendTo(args: { sender: Address; recipient: Address }) {
		const { sender, recipient } = args;

		const [latestApproval] = await db
			.select()
			.from(schema.shareApprovals)
			.where(
				and(
					eq(schema.shareApprovals.senderWallet, sender),
					eq(schema.shareApprovals.recipientWallet, recipient),
				),
			)
			.orderBy(desc(schema.shareApprovals.createdAt))
			.limit(1);

		return latestApproval ? latestApproval.active : false;
	}

	return { canSendTo };
}
