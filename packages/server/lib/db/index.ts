import dbClient from "./client";
import { dbExtensionHelpers } from "./extensions";

const db = Object.assign(dbClient, dbExtensionHelpers(dbClient));

export default db;
