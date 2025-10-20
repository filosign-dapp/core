import Dilithium from "dilithium-crystals-js";

const dilithiumKind = 3;

export async function keyGen(args: { seed: Uint8Array }) {
	const { seed } = args;

	const dl = await Dilithium;

	const pair = dl.generateKeys(dilithiumKind, seed);

	if (!pair || !pair.publicKey || !pair.privateKey) {
		throw new Error("Key generation failed");
	}

	return {
		publicKey: new Uint8Array(pair.publicKey),
		privateKey: new Uint8Array(pair.privateKey),
	};
}

export async function sign(args: {
	message: Uint8Array;
	privateKey: Uint8Array;
}) {
	const { message, privateKey } = args;

	const dl = await Dilithium;

	const { signature } = dl.sign(message, privateKey, dilithiumKind);
	if (!signature) {
		throw new Error("Signing failed");
	}
	return new Uint8Array(signature);
}

export async function verify(args: {
	message: Uint8Array;
	signature: Uint8Array;
	publicKey: Uint8Array;
}) {
	const { message, signature, publicKey } = args;
	const dl = await Dilithium;

	const { result } = dl.verify(message, signature, publicKey, dilithiumKind);

	return result !== 0;
}
