import { drizzle } from "drizzle-orm/node-postgres";
import env from "../../env";
import schema from "./schema";

const dbClient = drizzle(env.PG_URI, {
	schema,
	casing: "snake_case",
});

export default dbClient;
