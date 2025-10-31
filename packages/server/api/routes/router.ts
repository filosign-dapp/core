import { Hono } from "hono";
import type { Chain } from "viem";
import config from "../../config";
// import sharing from "./sharing";
import tx from "./tx";

export const apiRouter = new Hono()
	.get("/runtime", (ctx) => {
		const runtime: Runtime = {
			uptime: process.uptime(),
			chain: config.runtimeChain,
		};
		return ctx.json(runtime);
	})
	// .route("/auth", auth)
	.route("/files", files)
	// .route("/sharing", sharing)
	// .route("/user", user);
	.route("/tx", tx);

type Runtime = {
	uptime: number;
	chain: Chain;
};
