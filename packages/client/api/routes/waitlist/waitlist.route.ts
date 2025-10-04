import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { respond } from "@/api/lib/utils/respond";
import { db } from "@/api/lib/db";

const waitlist = new Hono()
  // Get all emails in waitlist
  .get("/", async (ctx) => {
    try {
      const emails = db
        .query(
          "SELECT id, email, created_at FROM waitlist ORDER BY created_at DESC",
        )
        .all();

      // Convert BigInt id to number for JSON serialization
      const serializedEmails = emails.map((email: any) => ({
        ...email,
        id: Number(email.id),
      }));

      return respond.ok(
        ctx,
        { emails: serializedEmails, count: serializedEmails.length },
        "Successfully fetched waitlist emails",
        200,
      );
    } catch (error) {
      console.error("Database error:", error);
      return respond.err(ctx, "Failed to fetch waitlist emails", 500);
    }
  })

  // Check if email exists
  .get("/check/:email", async (ctx) => {
    try {
      const email = ctx.req.param("email");

      if (!email || !z.string().email().safeParse(email).success) {
        return respond.err(ctx, "Invalid email format", 400);
      }

      const existing = db
        .query("SELECT id FROM waitlist WHERE email = $email")
        .get({ $email: email }) as { id: number } | undefined;

      return respond.ok(
        ctx,
        {
          exists: !!existing,
          email,
          id: existing ? Number(existing.id) : null,
        },
        "Email check completed",
        200,
      );
    } catch (error) {
      console.error("Database error:", error);
      return respond.err(ctx, "Failed to check email", 500);
    }
  })

  // Add email to waitlist
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        email: z.string().email("Invalid email format"),
      }),
    ),
    async (ctx) => {
      const { email } = ctx.req.valid("json");

      try {
        const addToWaitlist = db.transaction((email: string) => {
          const existing = db
            .query("SELECT id FROM waitlist WHERE email = $email")
            .get({ $email: email }) as { id: number } | undefined;

          if (existing) {
            throw new Error("Email already registered");
          }

          const result = db
            .query(
              `
            INSERT INTO waitlist (email, created_at, updated_at)
            VALUES ($email, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          `,
            )
            .run({ $email: email });

          return result;
        });

        const result = addToWaitlist(email);

        return respond.ok(
          ctx,
          {
            id: Number(result.lastInsertRowid),
            email,
          },
          "Successfully added to waitlist",
          201,
        );
      } catch (error) {
        console.error("Database error:", error);

        if (
          error instanceof Error &&
          error.message === "Email already registered"
        ) {
          return respond.err(ctx, "Email already registered", 409);
        }

        // Handle SQLite-specific errors
        if (error && typeof error === "object" && "code" in error) {
          const sqliteError = error as { code: number; message: string };
          console.error(
            `SQLite error ${sqliteError.code}: ${sqliteError.message}`,
          );

          // Handle constraint violations (e.g., unique constraint on email)
          if (sqliteError.code === 19) {
            // SQLITE_CONSTRAINT
            return respond.err(ctx, "Email already registered", 409);
          }
        }

        return respond.err(ctx, "Failed to add to waitlist", 500);
      }
    },
  )

  // Remove email from waitlist
  .delete("/:email", async (ctx) => {
    try {
      const email = ctx.req.param("email");

      if (!email || !z.string().email().safeParse(email).success) {
        return respond.err(ctx, "Invalid email format", 400);
      }

      const result = db
        .query("DELETE FROM waitlist WHERE email = $email")
        .run({ $email: email });

      if (result.changes === 0) {
        return respond.err(ctx, "Email not found in waitlist", 404);
      }

      return respond.ok(
        ctx,
        { email, deleted: true },
        "Successfully removed from waitlist",
        200,
      );
    } catch (error) {
      console.error("Database error:", error);
      return respond.err(ctx, "Failed to remove from waitlist", 500);
    }
  });

export default waitlist;
export type WaitlistType = typeof waitlist;
