import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { trimTrailingSlash } from "hono/trailing-slash";
import { respond } from "@/api/lib/utils/respond";
import routes from "./routes";

const hono = new Hono()
	.use(cors())
	.use(logger())
	.use(trimTrailingSlash())
	.route("/api/v1", routes)
	.get("*", (ctx) => {
		return respond.err(ctx, "Invalid v1 api route", 404);
	});

export default hono;
