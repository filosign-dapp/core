import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { isAddress } from "viem";
import db from "../../../lib/db";
import { respond } from "../../../lib/utils/respond";
import profile from "./profile";
import signatures from "./signatures";

const { users } = db.schema;

export default new Hono()
	.route("/profile", profile)
	.route("/signatures", signatures);
