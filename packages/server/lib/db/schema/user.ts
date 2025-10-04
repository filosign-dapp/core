import * as t from "drizzle-orm/sqlite-core";
import {
  tEvmAddress,
  tBytes32,
  tJsonString,
  timestamps,
  tBigInt,
} from "../helpers";

export const users = t.sqliteTable("users", {
  walletAddress: tEvmAddress().primaryKey(),
  email: t.text(),
  lastActiveAt: t.integer().notNull(),
  keygenDataJson: tJsonString(),
  encryptionPublicKey: tBytes32(),

  ...timestamps,
});

export const profiles = t.sqliteTable("profiles", {
  walletAddress: tEvmAddress()
    .references(() => users.walletAddress, {
      onDelete: "cascade",
    })
    .primaryKey(),
  username: t.text().notNull().unique(),
  displayName: t.text().notNull(),
  avatarUrl: t.text(),
  bio: t.text().default(""),
  metadataJson: tJsonString().default({ value: "{}" }),
});

export const usersDatasets = t.sqliteTable("users_datasets", {
  walletAddress: tEvmAddress().references(() => users.walletAddress, {
    onDelete: "cascade",
  }),
  dataSetId: t.integer().notNull(),
  providerAddress: t.text().notNull(),
  totalDepositedBaseUnits: tBigInt().notNull().default(0n),

  ...timestamps,
});

export const userSignatures = t.sqliteTable("user_signatures", {
  id: t
    .text()
    .primaryKey()
    .$default(() => Bun.randomUUIDv7()),
  walletAddress: tEvmAddress().references(() => users.walletAddress, {
    onDelete: "cascade",
  }),
  signatureUrl: t.text().notNull(),
  name: t.text().notNull(),

  ...timestamps,
});
