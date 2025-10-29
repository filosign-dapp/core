import { Hono } from "hono";
import type { Chain } from "viem";
import config from "../../config";
import auth from "./auth";
import files from "./files";
import requests from "./requests";
import tx from "./tx";
import user from "./user";

export const apiRouter = new Hono()
	.get("/runtime", (ctx) => {
		const runtime: Runtime = {
			uptime: process.uptime(),
			chain: config.runtimeChain,
		};

		return ctx.json(runtime);
	})
	// .route("/auth", auth)
	// .route("/files", files)
	// .route("/requests", requests)
	// .route("/user", user);
	.route("/tx", tx);

type Runtime = {
	uptime: number;
	chain: Chain;
};
