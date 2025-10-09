import "dotenv/config";
import os from "node:os";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { apiRouter } from "./api/routes/router";
import env from "./env";
import { startIndexer } from "./lib/indexer/engine";
import { startJobScheduler } from "./lib/jobrunner/scheduler";

//@ts-expect-error
BigInt.prototype.toJSON = function () {
	return this.toString();
};

startIndexer("FSFileRegistry");
startIndexer("FSKeyRegistry");
startIndexer("FSManager");
const workerId = `${os.hostname()}:${process.pid}`;
startJobScheduler(workerId);

export const app = new Hono()
	.use(logger())
	.use(
		cors({
			origin: [env.FRONTEND_URL],
			allowHeaders: ["Content-Type", "Authorization"],
			allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
			credentials: true,
		}),
	)
	.route("/api", apiRouter);

export default {
	port: 30011,
	fetch: app.fetch,
};
