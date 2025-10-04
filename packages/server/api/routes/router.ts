import { Hono } from "hono";
import auth from "./auth";
import files from "./files";
import requests from "./requests";
import user from "./user";

export const apiRouter = new Hono()
  .route("/auth", auth)
  .route("/files", files)
  .route("/requests", requests)
  .route("/user", user);
