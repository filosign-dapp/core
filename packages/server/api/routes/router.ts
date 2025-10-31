import { Hono } from "hono";
import type { Chain } from "viem";
import config from "../../config";
import files from "./files";
// import sharing from "./sharing";
import files from "./files";
import tx from "./tx";
// import auth from "./auth";
import users from "./users";

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
	.route("/users", users)
	.route("/tx", tx);

type Runtime = {
	uptime: number;
	chain: Chain;
};
