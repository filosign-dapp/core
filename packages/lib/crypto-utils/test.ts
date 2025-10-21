// pq-system.ts
import type { webcrypto as WebCryptoType } from "node:crypto";

const nodeCrypto =
	typeof globalThis !== "undefined" && (globalThis as any).crypto
		? (globalThis as any).crypto
		: typeof require !== "undefined"
			? (require("node:crypto") as any).webcrypto
			: undefined;
const crypto: WebCryptoType = nodeCrypto;

import dilithium from "crystals-dilithium";
import kyber from "crystals-kyber";

function toUint8(input: ArrayBuffer | Uint8Array | Buffer): Uint8Array {
	if (input instanceof Uint8Array) return input;
	return new Uint8Array(input);
}

function concat(...parts: Uint8Array[]) {
	const total = parts.reduce((s, p) => s + p.length, 0);
	const out = new Uint8Array(total);
	let offset = 0;
	for (const p of parts) {
		out.set(p, offset);
		offset += p.length;
	}
	return out;
}

async function sha512(data: Uint8Array): Promise<Uint8Array> {
	const h = await crypto.subtle.digest("SHA-512", data);
	return toUint8(h);
}

async function hkdfSha512ExtractAndExpand(
	ikm: Uint8Array,
	salt: Uint8Array | undefined,
	info: Uint8Array,
	length: number,
) {
	const saltUsed = salt ?? new Uint8Array(64);
	const key = await crypto.subtle.importKey(
		"raw",
		ikm,
		{ name: "HKDF" },
		false,
		["deriveBits"],
	);
	const bits = await crypto.subtle.deriveBits(
		{ name: "HKDF", hash: "SHA-512", salt: saltUsed, info },
		key,
		length * 8,
	);
	return toUint8(bits);
}

async function deriveAesKeyFromSecret(secret: Uint8Array) {
	const raw = await hkdfSha512ExtractAndExpand(
		secret,
		undefined,
		new TextEncoder().encode("kyber1024|aes256|v1"),
		32,
	);
	return crypto.subtle.importKey("raw", raw, { name: "AES-GCM" }, false, [
		"encrypt",
		"decrypt",
	]);
}

function randomBytesSync(length: number) {
	const b = new Uint8Array(length);
	crypto.getRandomValues(b);
	return b;
}

export type PQSExports = {
	keyGen: (args: { info?: string }) => {
		secretKey: Uint8Array;
		publicKey: Uint8Array;
	};
	sign: (args: { message: Uint8Array; secretKey: Uint8Array }) => Uint8Array;
	verify: (args: {
		message: Uint8Array;
		signature: Uint8Array;
		publicKey: Uint8Array;
	}) => boolean;
	hash: (args: { message: Uint8Array }) => Promise<Uint8Array>;
	randomBytes: (args: { length: number }) => Uint8Array;
	keyExchange: (args: {
		publicKeyOther: Uint8Array;
		secretKeySelf: Uint8Array;
	}) => Promise<Uint8Array>;
	encrypt: (args: {
		message: Uint8Array;
		publicKey: Uint8Array;
	}) => Promise<Uint8Array>;
	decrypt: (args: {
		ciphertext: Uint8Array;
		secretKey: Uint8Array;
	}) => Promise<Uint8Array>;
};

const pq: PQSExports = {
	keyGen: async ({ info } = {}) => {
		if (info && typeof kyber.KeyGenFromSeed === "function") {
			const seed = await (async (): Promise<Uint8Array> => {
				const h = await sha512(new TextEncoder().encode(info));

				return h.slice(0, 32);
			})();
		}

		const pair = kyber.KeyGen1024();
		return { secretKey: toUint8(pair[1]), publicKey: toUint8(pair[0]) };
	},

	sign: ({ message, secretKey }) => {
		return toUint8(dilithium.Sign(message, secretKey));
	},

	verify: ({ message, signature, publicKey }) => {
		return Boolean(dilithium.Verify(message, signature, publicKey));
	},

	hash: async ({ message }) => {
		return sha512(message);
	},

	randomBytes: ({ length }) => {
		return randomBytesSync(length);
	},

	keyExchange: async ({ publicKeyOther, secretKeySelf }) => {
		try {
			const maybeShared = kyber.Decrypt1024(publicKeyOther, secretKeySelf);
			return toUint8(maybeShared);
		} catch {
			const [ct, shared] = kyber.Encrypt1024(publicKeyOther);
			return concat(toUint8(ct), toUint8(shared));
		}
	},

	encrypt: async ({ message, publicKey }) => {
		const [ct, shared] = kyber.Encrypt1024(publicKey);
		const aesKey = await deriveAesKeyFromSecret(toUint8(shared));
		const iv = randomBytesSync(12);
		const ctPayload = await crypto.subtle.encrypt(
			{ name: "AES-GCM", iv, additionalData: new Uint8Array(0) },
			aesKey,
			message,
		);
		return concat(toUint8(ct), iv, toUint8(ctPayload));
	},

	decrypt: async ({ ciphertext, secretKey }) => {
		const ctMaybeLen = (() => {
			try {
				const [ctExample] = kyber.Encrypt1024(
					new Uint8Array(kyber.KeyGen1024()[0].length),
				);
				return ctExample.length;
			} catch {
				return 1088;
			}
		})();
		const ct = ciphertext.slice(0, ctMaybeLen);
		const iv = ciphertext.slice(ctMaybeLen, ctMaybeLen + 12);
		const ctPayload = ciphertext.slice(ctMaybeLen + 12);
		const shared = kyber.Decrypt1024(ct, secretKey);
		const aesKey = await deriveAesKeyFromSecret(toUint8(shared));
		const plain = await crypto.subtle.decrypt(
			{ name: "AES-GCM", iv, additionalData: new Uint8Array(0) },
			aesKey,
			ctPayload,
		);
		return toUint8(plain);
	},
};

export default pq;
