import { z } from "zod";

export const profileSchema = z.object({
  personal: z.object({
    fullName: z
      .string()
      .min(1, "Full name is required")
      .max(100, "Full name too long"),
    bio: z.string().max(500, "Bio must be less than 500 characters"),
    walletAddress: z.string().optional(),
  }),
  preferences: z.object({
    emailNotifications: z.boolean(),
    pushNotifications: z.boolean(),
    twoFactorAuth: z.boolean(),
  }),
  profilePicture: z.string().nullable(),
  pin: z
    .object({
      current: z
        .string()
        .min(1, "Current PIN is required")
        .regex(/^\d{6}$/, "PIN must be exactly 6 digits"),
      new: z
        .string()
        .min(1, "New PIN is required")
        .regex(/^\d{6}$/, "PIN must be exactly 6 digits"),
      confirm: z.string().min(1, "Please confirm your PIN"),
    })
    .refine((data) => data.new === data.confirm, {
      message: "PINs don't match",
      path: ["pin", "confirm"],
    }),
});
