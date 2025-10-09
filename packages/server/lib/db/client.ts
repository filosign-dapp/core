import { Database } from "bun:sqlite";
import { SQL } from "bun";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { sqliteFile } from "../../drizzle.config";
import schema from "./schema";

function getSqliteClient() {
	const sqlite = new Database(sqliteFile);
	sqlite.run("PRAGMA foreign_keys = ON");
	return sqlite;
}

export const createDbClient = () =>
	drizzle({
		client: getSqliteClient(),
		schema: schema,
		casing: "snake_case",
	});

const dbClient = createDbClient();

export default dbClient;
export const sql = new SQL(sqliteFile);
