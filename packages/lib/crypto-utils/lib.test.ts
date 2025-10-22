import { describe, expect, it } from "bun:test";
import cryptoUtils from "./src/lib-node";

const { KEM, encryption, hash, signatures, utils } = cryptoUtils;

describe("KEM (Kyber1024)", async () => {
	it("should generate keypair determistically by input seed", async () => {
		const seed = utils.randomBytes(64);
		const { privateKey: pvt1, publicKey: pub1 } = await KEM.keyGen({ seed });
		const { privateKey: pvt2, publicKey: pub2 } = await KEM.keyGen({ seed });
		expect(pvt1).toEqual(pvt2);
		expect(pub1).toEqual(pub2);

		const seed2 = utils.randomBytes(64);
		const { privateKey: pvt3, publicKey: pub3 } = await KEM.keyGen({
			seed: seed2,
		});
		expect(pvt1).not.toEqual(pvt3);
		expect(pub1).not.toEqual(pub3);
	});

	it("should be able to genarate, encapsulate and decapsulate shared secret among two parteis", async () => {
		const receiver = await KEM.keyGen({ seed: utils.randomBytes(64) });

		const { ciphertext, sharedSecret: ssA } = await KEM.encapsulate({
			publicKeyOther: receiver.publicKey,
		});
		const { sharedSecret: ssE } = await KEM.decapsulate({
			ciphertext,
			privateKeySelf: receiver.privateKey,
		});

		expect(ssA).toEqual(ssE);

		console.log("KEM public key size: ", receiver.publicKey.length);
	});
});

describe("Signatures (Dilithium)", async () => {
	it("should geenerate keypair determistically by input seed", async () => {
		const seed = utils.randomBytes(64);
		const { privateKey: pvt1, publicKey: pub1 } = await signatures.keyGen({
			seed,
		});
		const { privateKey: pvt2, publicKey: pub2 } = await signatures.keyGen({
			seed,
		});
		expect(pvt1).toEqual(pvt2);
		expect(pub1).toEqual(pub2);

		const seed2 = utils.randomBytes(64);
		const { privateKey: pvt3, publicKey: pub3 } = await signatures.keyGen({
			seed: seed2,
		});
		expect(pvt1).not.toEqual(pvt3);
		expect(pub1).not.toEqual(pub3);
	});

	it("should be able to sign and verify message", async () => {
		const signer = await signatures.keyGen({
			seed: utils.randomBytes(64),
		});
		const message = utils.randomBytes(2056);

		const signature = await signatures.sign({
			message,
			privateKey: signer.privateKey,
		});
		const isValid = await signatures.verify({
			message,
			signature,
			publicKey: signer.publicKey,
		});
		expect(isValid).toBe(true);

		message.fill(0xff, 0, 10); // tamper the message
		const isValidFake = await signatures.verify({
			message,
			signature,
			publicKey: signer.publicKey,
		});
		expect(isValidFake).toBe(false);

		console.log("DL3 Public key size: ", signer.publicKey.length);
		console.log("Signature size: ", signature.length);
	});
});

describe("Encryption (AES-GCM)", async () => {
	it("entire encryption workflow with KEM is tested and it works", async () => {
		const receiver = await KEM.keyGen({ seed: utils.randomBytes(64) });

		//sender
		const { ciphertext: kemCiphertext, sharedSecret: ssA } =
			await KEM.encapsulate({
				publicKeyOther: receiver.publicKey,
			});

		const message = utils.randomBytes(16_777_216);

		const encryptedMessage = await encryption.encrypt({
			message,
			sharedSecret: ssA,
			info: "encryption info",
		});

		//receiver
		const { sharedSecret: ssE } = await KEM.decapsulate({
			ciphertext: kemCiphertext,
			privateKeySelf: receiver.privateKey,
		});

		const decryptedMessage = await encryption.decrypt({
			ciphertext: encryptedMessage,
			sharedSecret: ssE,
			info: "encryption info",
		});

		expect(decryptedMessage).toEqual(message);
	});
});
