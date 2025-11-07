const envKeys = [
	"BUN_VERSION",
	"PORT",
	"PRIVY_APP_SECRET",
	"BUN_PUBLIC_SERVER_URL",
	"BUN_PUBLIC_PRIVY_APP_ID",
	"BUN_PUBLIC_PLATFORM_URL",
] as const;

type ENV = Record<(typeof envKeys)[number], string>;

let env: ENV = {} as any;

export function ensureEnv() {
	for (const key of envKeys) {
		if (!Bun.env[key]) {
			throw new Error(`Environment variable ${key} is not set`);
		}
	}

	env = Object.fromEntries(envKeys.map((key) => [key, Bun.env[key]])) as ENV;
}
const isProd =
	process.env["NODE_ENV"] === "production" ||
	process.env["NODE_ENV"] === "prod";
ensureEnv();

export { env, isProd };
