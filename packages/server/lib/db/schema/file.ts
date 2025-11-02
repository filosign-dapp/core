import * as t from "drizzle-orm/pg-core";
import { tBytes32, tEvmAddress, tHex, timestamps } from "../helpers";
import { users } from "./user";

export const files = t.pgTable(
    "files",
    {
        pieceCid: t.text().notNull().primaryKey(),
        sender: tEvmAddress()
            .notNull()
            .references(() => users.walletAddress),

        senderEncryptedEncryptionKey: tHex().notNull(),

        status: t.text({ enum: ["s3", "foc", "unpaid_for", "invalid"] }).notNull(),
        onchainTxHash: tBytes32().unique().notNull(),

        ...timestamps,
    },
    (table) => [t.index("idx_files_owner").on(table.sender)],
);

export const fileRecipients = t.pgTable(
    "file_recipients",
    {
        filePieceCid: t
            .text()
            .notNull()
            .references(() => files.pieceCid, { onDelete: "cascade" }),
        ack: tHex(),
        recipientWallet: tEvmAddress().notNull(),
        kemCiphertext: tHex().notNull(),
        encryptedEncryptionKey: tHex().notNull(),

        ...timestamps,
    },
    // (table) => [t.index("idx_file_recipients_file").on(table.filePieceCid)],
);

export const fileSignatures = t.pgTable(
    "file_signatures",
    {
        filePieceCid: t
            .text()
            .notNull()
            .references(() => files.pieceCid, { onDelete: "cascade" }),
        signer: t.text().notNull(),
        signatureVisualHash: tBytes32().notNull(),
        evmSignature: tHex().notNull(),
        dl3Signature: tHex().notNull(),
        timestamp: t.integer().notNull(),
        onchainTxHash: t.text(),

        ...timestamps,
    },
    (table) => [t.index("idx_signatures_file").on(table.filePieceCid)],
);

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
