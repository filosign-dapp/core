import "dotenv/config";
import os from "node:os";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { Chain } from "viem";
import { apiRouter } from "./api/routes/router";
import config from "./config";
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
	.get("/runtime", (ctx) => {
		const runtime: Runtime = {
			uptime: process.uptime(),
			chain: config.runtimeChain,
		};

		return ctx.json(runtime);
	})
	.route("/v1", apiRouter);

export default {
	port: 30011,
	fetch: app.fetch,
};

type Runtime = {
	uptime: number;
	chain: Chain;
};
