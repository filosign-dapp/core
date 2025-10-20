import kyber from "crystals-kyber";

type KeyPair = {
	publicKey: Uint8Array;
	secretKey: Uint8Array;
};

type EncapResult = {
	ciphertext: Uint8Array;
	sharedSecret: Uint8Array;
};

type DecapResult = {
	sharedSecret: Uint8Array;
};

type ComputeSharedArgs =
	| { publicKeyOther: Uint8Array } // initiator: encapsulate to peer's public key
	| { ciphertext: Uint8Array; secretKeySelf: Uint8Array }; // responder: decapsulate

function toUint8(a: ArrayBuffer | Uint8Array | Buffer): Uint8Array {
	if (a instanceof Uint8Array) return a;
	return new Uint8Array(a);
}

export function keyGen(): KeyPair {
	const pair = kyber.KeyGen1024();
	return {
		publicKey: toUint8(pair[0]),
		secretKey: toUint8(pair[1]),
	};
}

export function computeShared(
	args: ComputeSharedArgs,
): EncapResult | DecapResult {
	if ("publicKeyOther" in args) {
		const [ct, ss] = kyber.Encrypt1024(args.publicKeyOther);
		return { ciphertext: toUint8(ct), sharedSecret: toUint8(ss) };
	}

	if ("ciphertext" in args && "secretKeySelf" in args) {
		const ss = kyber.Decrypt1024(args.ciphertext, args.secretKeySelf);
		return { sharedSecret: toUint8(ss) };
	}

	throw new Error("Invalid arguments to computeShared");
}
