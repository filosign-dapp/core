import { hc } from "hono/client";
import type { ProfileType } from "@/api/routes/profile";
import type { WaitlistType } from "@/api/routes/waitlist";

const baseUrl =
	process.env.BUN_PUBLIC_SERVER_URL || "http://localhost:3000/api/v1";

const client = {
	profile: hc<ProfileType>(`${baseUrl}/profile`),
	waitlist: hc<WaitlistType>(`${baseUrl}/waitlist`),
};

export default client;
