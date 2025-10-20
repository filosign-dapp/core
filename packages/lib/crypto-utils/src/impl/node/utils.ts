import { toHex } from "viem";

export function randomBytes(n = 32) {
	return crypto.getRandomValues(new Uint8Array(n));
}

export function randomHex(n = 32) {
	const bytes = randomBytes(n);
	return toHex(bytes);
}
