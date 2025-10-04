import * as t from "drizzle-orm/sqlite-core";
import {
  tBigInt,
  tBoolean,
  tEvmAddress,
  tBytes32,
  tHex,
  timestamps,
  tJsonString,
} from "../helpers";
import { users } from "./user";

export const files = t.sqliteTable(
  "files",
  {
    pieceCid: t.text().primaryKey(),
    ownerWallet: tEvmAddress()
      .notNull()
      .references(() => users.walletAddress),

    encryptedKey: tHex(),
    encryptedKeyIv: tHex(),
    metadata: tJsonString(),

    onchainTxHash: tBytes32(),

    ...timestamps,
  },
  (table) => [
    t.index("idx_files_owner").on(table.ownerWallet),
    t.uniqueIndex("ux_files_pieceCid").on(table.pieceCid),
    t.uniqueIndex("ux_files_onchainTxHash").on(table.onchainTxHash),
  ],
);

export const fileAcknowledgements = t.sqliteTable(
  "file_acknowledgements",
  {
    filePieceCid: t
      .text()
      .notNull()
      .references(() => files.pieceCid, { onDelete: "cascade" }),
    recipientWallet: tEvmAddress().notNull(),
    acknowledgedTxHash: tBytes32(),

    ...timestamps,
  },
  (table) => [
    t
      .uniqueIndex("ux_file_acknowledgements_file_recipient")
      .on(table.filePieceCid, table.recipientWallet),
    t.index("idx_file_acknowledgements_file").on(table.filePieceCid),
  ],
);

export const fileRecipients = t.sqliteTable(
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

export const fileSignatures = t.sqliteTable(
  "file_signatures",
  {
    id: t.text().primaryKey().default("uuid_generate_v4()"),
    filePieceCid: t
      .text()
      .notNull()
      .references(() => files.pieceCid, { onDelete: "cascade" }),
    signerWallet: t.text().notNull(),
    signatureVisualHash: tBytes32().notNull(),
    compactSignature: t.text().notNull(),
    timestamp: t.integer().notNull(),
    onchainTxHash: t.text(),

    ...timestamps,
  },
  (table) => [t.index("idx_signatures_file").on(table.filePieceCid)],
);
