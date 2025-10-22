import {
	type Address,
	encodePacked,
	type Hex,
	keccak256,
	ripemd160,
	toBytes,
	toHex,
} from "viem";

export { toHex, toBytes };

export function randomBytes(n = 32) {
	return crypto.getRandomValues(new Uint8Array(n));
}

export function randomHex(n = 32) {
	const bytes = randomBytes(n);
	return toHex(bytes);
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
