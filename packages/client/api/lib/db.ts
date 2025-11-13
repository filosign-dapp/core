import { Database } from "bun:sqlite";
import { existsSync, mkdirSync } from "node:fs";

// Create data directory if it doesn't exist
if (!existsSync("db")) {
	mkdirSync("db", { recursive: true });
}

const db = new Database("db/filosign.db", { safeIntegers: true });

// Initialize database schema
db.run(`
  CREATE TABLE IF NOT EXISTS waitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run("PRAGMA journal_mode = WAL");
db.run("CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email)");

export function closeDatabase() {
	try {
		db.close(false);
	} catch (_) {
		try {
			db.close(true);
		} catch {}
	}
}

export { db };
