import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { respond } from "@/api/lib/utils/respond";

const profile = new Hono().get(
	"/",
	zValidator(
		"query",
		z.object({
			name: z.string(),
		}),
	),
	async (ctx) => {
		const { name } = ctx.req.valid("query");

		if (!name) {
			return respond.err(ctx, "Name is required", 400);
		}

		return respond.ok(
			ctx,
			{
				name,
			},
			"Successfully fetched data",
			200,
		);
	},
);

export default profile;
export type ProfileType = typeof profile;
