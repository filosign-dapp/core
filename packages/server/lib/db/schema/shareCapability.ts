import * as t from "drizzle-orm/pg-core";
import { tBytes32, tEvmAddress, timestamps } from "../helpers";
import { users } from "./user";

export const shareApprovals = t.pgTable(
	"share_approvals",
	{
		id: t.uuid().primaryKey().defaultRandom(),

		recipientWallet: tEvmAddress()
			.notNull()
			.references(() => users.walletAddress),
		senderWallet: tEvmAddress()
			.notNull()
			.references(() => users.walletAddress),

		active: t.boolean().notNull().default(false),
		txHash: tBytes32().unique().notNull(),

		createdAt: t
			.integer()
			.notNull()
			.$default(() => Date.now()),
	},
	(table) => [
		t.index("idx_share_approvals_recipient").on(table.recipientWallet),
		t.index("idx_share_approvals_sender").on(table.senderWallet),
	],
);

export const shareRequests = t.pgTable("share_requests", {
	id: t.uuid().primaryKey().defaultRandom(),

	senderWallet: tEvmAddress()
		.notNull()
		.references(() => users.walletAddress),
	recipientWallet: tEvmAddress().notNull(),

	status: t
		.text({ enum: ["PENDING", "ACCEPTED", "REJECTED", "CANCELLED"] })
		.notNull()
		.default("PENDING"),
	message: t.text(),

	...timestamps,
});
