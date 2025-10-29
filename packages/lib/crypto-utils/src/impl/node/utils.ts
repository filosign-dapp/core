import {
	type Account,
	type Address,
	type Chain,
	type Client,
	encodePacked,
	type Hex,
	keccak256,
	ripemd160,
	type Transport,
	toBytes,
	toHex,
	type WalletClient,
} from "viem";
import { argon, hash } from "./hash";
import * as KEM from "./KEM";
import * as signatures from "./signatures";

export { toHex, toBytes };

export function randomBytes(n = 32) {
	return crypto.getRandomValues(new Uint8Array(n));
}

export function randomHex(n = 32) {
	const bytes = randomBytes(n);
	return toHex(bytes);
}

export async function hkdfExtractExpand(
	source: Uint8Array,
	salt: Uint8Array | null,
	info: Uint8Array | null,
	length: number,
): Promise<Uint8Array> {
	const subtle = crypto.subtle;
	const hkdfKey = await subtle.importKey(
		"raw",
		source as BufferSource,
		"HKDF",
		false,
		["deriveBits"],
	);
	const derivedBits = await subtle.deriveBits(
		{
			name: "HKDF",
			hash: "SHA-256",
			salt: (salt ?? new Uint8Array([])) as BufferSource,
			info: (info ?? new Uint8Array([])) as BufferSource,
		},
		hkdfKey,
		length * 8,
	);
	return new Uint8Array(derivedBits);
}

export function generateRegisterChallenge(
	userAddress: Address,
	salt: Hex,
	info: string,
) {
	const challenge = `filosign:${userAddress}:${salt}:${info}`;
	return challenge;
}

export function computeCommitment(args: (string | number)[]) {
	function determineType(value: string | number): "string" | "uint256" {
		if (typeof value === "string") {
			return "string";
		}
		if (typeof value === "number") {
			return "uint256";
		}
		throw new Error("Unsupported type");
	}

	const types = args.map((i) => determineType(i));
	//@ts-expect-error <- this is very important here and I don't think there is a way to fix this
	return ripemd160(keccak256(encodePacked(types, args)));
}

export async function walletKeyGen(
	wallet: Wallet,
	args: {
		pin: string;
		salts?: {
			challenge: Hex;
			seed: Hex;
			pin: Hex;
		};
	},
) {
	const { pin, salts } = args;
	const saltPin = salts?.pin ? toBytes(salts.pin) : randomBytes(16);
	const saltSeed = salts?.seed ? toBytes(salts.seed) : randomBytes(16);
	const saltChallenge = salts?.challenge
		? toBytes(salts.challenge)
		: randomBytes(16);

	const pinArgoned = argon(hash(pin));

	const registerChallenge = generateRegisterChallenge(
		wallet.account.address,
		toHex(saltChallenge),
		pinArgoned.toString(),
	);

	const signature = await wallet.signMessage({
		message: registerChallenge,
	});

	const seed = await hkdfExtractExpand(
		saltSeed,
		toBytes(signature),
		toBytes(pinArgoned.toString()),
		64,
	);

	const kemKeypair = await KEM.keyGen({ seed });
	const sigKeypair = await signatures.keyGen({ seed });

	const commitmentKem = computeCommitment([kemKeypair.publicKey.toString()]);
	const commitmentSig = computeCommitment([sigKeypair.publicKey.toString()]);

	return {
		seed,
		saltPin: toHex(saltPin),
		saltSeed: toHex(saltSeed),
		saltChallenge: toHex(saltChallenge),
		kemKeypair,
		sigKeypair,
		commitmentKem,
		commitmentSig,
	};
}

export async function seedKeyGen(seed: Uint8Array<ArrayBuffer>) {
	const kemKeypair = await KEM.keyGen({ seed });
	const sigKeypair = await signatures.keyGen({ seed });

	const commitmentKem = computeCommitment([kemKeypair.publicKey.toString()]);
	const commitmentSig = computeCommitment([sigKeypair.publicKey.toString()]);

	return {
		kemKeypair,
		sigKeypair,
		commitmentKem,
		commitmentSig,
	};
}

export type Wallet = WalletClient<Transport, Chain, Account>;
