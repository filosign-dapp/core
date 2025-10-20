import kyber from "crystals-kyber";

function toUint8(input: ArrayBuffer | Uint8Array | Buffer) {
	if (input instanceof Uint8Array) return input;
	return new Uint8Array(input);
}

export function keyGen() {
	const pair = kyber.KeyGen1024();
	return {
		publicKey: toUint8(pair[0]),
		secretKey: toUint8(pair[1]),
	};
}

export function encapsulate(publicKeyOther: Uint8Array) {
	const [ciphertext, sharedSecret] = kyber.Encrypt1024(publicKeyOther);
	return {
		ciphertext: toUint8(ciphertext),
		sharedSecret: toUint8(sharedSecret),
	};
}

export function decapsulate(ciphertext: Uint8Array, secretKeySelf: Uint8Array) {
	const sharedSecret = kyber.Decrypt1024(ciphertext, secretKeySelf);
	return { sharedSecret: toUint8(sharedSecret) };
}
