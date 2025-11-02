import { Hono } from "hono";
import type { Chain } from "viem";
import config from "../../config";
import auth from "./auth";
import files from "./files";
import tx from "./tx";
import users from "./users";

export const apiRouter = new Hono()
    .get("/runtime", (ctx) => {
        const runtime: Runtime = {
            uptime: process.uptime(),
            serverAddressSynapse: config.serverAddressSynapse,
            chain: config.runtimeChain,
        };
        return ctx.json(runtime);
    })
    .route("/auth", auth)
    .route("/files", files)
    // .route("/sharing", sharing)
    .route("/users", users)
    .route("/tx", tx);

type Runtime = {
    uptime: number;
    serverAddressSynapse: string;
    chain: Chain;
};
