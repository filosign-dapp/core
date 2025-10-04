import { Hono } from "hono";
import db from "../../../lib/db";
import { bodyLimit } from "hono/body-limit";
import { KB } from "../../../constants";
import { respond } from "../../../lib/utils/respond";
import { bucket } from "../../../lib/s3/client";
import { keccak256 } from "viem";

const { userSignatures } = db.schema;

export default new Hono().post(
  "/",
  bodyLimit({
    maxSize: 100 * KB,
    onError: (ctx) => respond.err(ctx, "Request body too large", 413),
  }),
  async (ctx) => {
    const body = await ctx.req.parseBody();
    const uploaded = body["file"];
    const name = body["name"];

    if (!uploaded) {
      return respond.err(ctx, "no file provided", 400);
    }
    if (!(uploaded instanceof File)) {
      return respond.err(ctx, "invalid file", 400);
    }
    if (uploaded.size > 50 * KB) {
      return respond.err(ctx, "file too large [<50KB]", 413);
    }
    if (typeof name !== "string" || name.length < 3 || name.length > 32) {
      return respond.err(ctx, "invalid name [3<len<32]", 400);
    }

    const bytes = await uploaded.bytes();

    const signatureVisualHash = keccak256(bytes);

    const key = `signatures/${signatureVisualHash}.png`;
    const file = bucket.file(key);
    await file.write(bytes);

    const dbEntry = db
      .insert(userSignatures)
      .values({
        name,
        visualHash: signatureVisualHash,
        storageBucketPath: key,
      })
      .returning()
      .get();

    return respond.ok(ctx, dbEntry, "Signature uploaded successfully", 201);
  },
);
