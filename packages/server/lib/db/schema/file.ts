import * as t from "drizzle-orm/pg-core";
import { tBytes32, tEvmAddress, tHex, timestamps } from "../helpers";
import { users } from "./user";

export const files = t.pgTable(
	"files",
	{
		id: t.uuid().primaryKey().defaultRandom(),
		pieceCid: t.text().notNull().unique(),
		sender: tEvmAddress()
			.notNull()
			.references(() => users.walletAddress),

		status: t.text({ enum: ["s3", "foc", "unpaid_for", "invalid"] }).notNull(),
		kemCiphertext: tHex().notNull(),
		onchainTxHash: tBytes32().unique().notNull(),

		...timestamps,
	},
	(table) => [t.index("idx_files_owner").on(table.sender)],
);

// export const fileAcknowledgements = t.sqliteTable(
// 	"file_acknowledgements",
// 	{
// 		filePieceCid: t
// 			.text()
// 			.notNull()
// 			.references(() => files.pieceCid, { onDelete: "cascade" }),
// 		recipientWallet: tEvmAddress().notNull(),
// 		acknowledgedTxHash: tBytes32(),

// 		...timestamps,
// 	},
// 	(table) => [
// 		t
// 			.uniqueIndex("ux_file_acknowledgements_file_recipient")
// 			.on(table.filePieceCid, table.recipientWallet),
// 		t.index("idx_file_acknowledgements_file").on(table.filePieceCid),
// 	],
// );

export const fileRecipients = t.pgTable(
	"file_recipients",
	{
		filePieceCid: t
			.text()
			.notNull()
			.references(() => files.pieceCid, { onDelete: "cascade" }),
		recipientWallet: tEvmAddress().notNull(),

		...timestamps,
	},
	(table) => [
		t
			.uniqueIndex("ux_file_recipients_file_recipient")
			.on(table.filePieceCid, table.recipientWallet),
		t.index("idx_file_recipients_file").on(table.filePieceCid),
	],
);

// export const fileSignatures = t.sqliteTable(
// 	"file_signatures",
// 	{
// 		id: t.text().primaryKey().default("uuid_generate_v4()"),
// 		filePieceCid: t
// 			.text()
// 			.notNull()
// 			.references(() => files.pieceCid, { onDelete: "cascade" }),
// 		signerWallet: t.text().notNull(),
// 		signatureVisualHash: tBytes32().notNull(),
// 		compactSignature: t.text().notNull(),
// 		timestamp: t.integer().notNull(),
// 		onchainTxHash: t.text(),

// 		...timestamps,
// 	},
// 	(table) => [t.index("idx_signatures_file").on(table.filePieceCid)],
// );

// export const fileKeys = t.sqliteTable(
// 	"file_keys",
// 	{
// 		filePieceCid: t
// 			.text()
// 			.notNull()
// 			.references(() => files.pieceCid, { onDelete: "cascade" }),
// 		recipientWallet: tEvmAddress().notNull(),
// 		encryptedKey: tHex().notNull(),
// 		encryptedKeyIv: tHex().notNull(),

// 		...timestamps,
// 	},
// 	(table) => [
// 		t
// 			.uniqueIndex("ux_file_keys_file_recipient")
// 			.on(table.filePieceCid, table.recipientWallet),
// 		t.index("idx_file_keys_file").on(table.filePieceCid),
// 	],
// );
