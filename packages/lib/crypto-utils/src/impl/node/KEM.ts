import { MlKem1024 as KEM } from "crystals-kyber-js";

export async function keyGen(seed: Uint8Array) {
	const kyber = new KEM();

	if (seed.length !== 64) {
		throw new Error("Seed must be 64 bytes long");
	}

	const [pkR, skR] = await kyber.deriveKeyPair(seed);

	return {
		publicKey: new Uint8Array(pkR),
		secretKey: new Uint8Array(skR),
	};
}

export async function encapsulate(publicKeyOther: Uint8Array) {
	const kyber = new KEM();

	const [ciphertext, sharedSecret] = await kyber.encap(publicKeyOther);

	return {
		ciphertext: new Uint8Array(ciphertext),
		sharedSecret: new Uint8Array(sharedSecret),
	};
}

export async function decapsulate(
	ciphertext: Uint8Array,
	secretKeySelf: Uint8Array,
) {
	const kyber = new KEM();

	const sharedSecret = await kyber.decap(ciphertext, secretKeySelf);
	return { sharedSecret: new Uint8Array(sharedSecret) };
}
