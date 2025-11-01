import * as t from "drizzle-orm/pg-core";
import { tEvmAddress, tHex, timestamps, tJsonString } from "../helpers";

export const users = t.pgTable("users", {
	walletAddress: tEvmAddress().primaryKey(),
	// email: t.text(),
	lastActiveAt: t.integer().notNull(),
	keygenDataJson: tJsonString(),
	encryptionPublicKey: t.text().notNull(),
	signaturePublicKey: t.text().notNull(),

	// ...timestamps,
});

// export const profiles = t.sqliteTable("profiles", {
// 	walletAddress: tEvmAddress()
// 		.references(() => users.walletAddress, {
// 			onDelete: "cascade",
// 		})
// 		.primaryKey(),
// 	username: t.text().notNull().unique(),
// 	displayName: t.text().notNull(),
// 	avatarUrl: t.text(),
// 	bio: t.text().default(""),
// 	metadataJson: tJsonString().default({ value: "{}" }),
// });

export const usersDatasets = t.pgTable("users_datasets", {
	walletAddress: tEvmAddress()
		.references(() => users.walletAddress, {
			onDelete: "cascade",
		})
		.primaryKey(),
	dataSetId: t.integer().notNull(),
	providerAddress: t.text().notNull(),
	totalDepositedBaseUnits: t.bigint({ mode: "bigint" }).notNull().default(0n),

	...timestamps,
});

// export const userSignatures = t.sqliteTable("user_signatures", {
// 	id: t
// 		.text()
// 		.primaryKey()
// 		.$default(() => Bun.randomUUIDv7()),
// 	walletAddress: tEvmAddress().references(() => users.walletAddress, {
// 		onDelete: "cascade",
// 	}),
// 	storageBucketPath: t.text().notNull(),
// 	visualHash: tBytes32().notNull(),
// 	name: t.text().notNull(),

// 	...timestamps,
// });
