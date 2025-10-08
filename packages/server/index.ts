import "dotenv/config";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { startIndexer } from "./lib/indexer/engine";
import { startJobScheduler } from "./lib/jobrunner/scheduler";
import { apiRouter } from "./api/routes/router";
import os from "os";
import env from "./env";

//@ts-ignore
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
