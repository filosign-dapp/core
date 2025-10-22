import {
	computeCommitment,
	hash as fsHash,
	generateRegisterChallenge,
	KEM,
	randomBytes,
} from "@filosign/crypto-utils/node";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { describe, it } from "mocha";
import {
	concatHex,
	encodePacked,
	keccak256,
	publicActions,
	ripemd160,
	sliceHex,
} from "viem";

async function setupFixture() {
	const [deployer, user] = await hre.viem.getWalletClients();
	const admin = (await hre.viem.getTestClient()).extend(publicActions);

	const manager = await hre.viem.deployContract("FSManager");
	const keyRegistry = await hre.viem.getContractAt(
		"FSKeyRegistry",
		await manager.read.keyRegistry(),
	);

	return { deployer, user, keyRegistry, admin };
}

describe("FSKeyRegistry", () => {
	it("stores relevant information for the user to be able to regenerate encryption keys", async () => {
		const { keyRegistry, user, admin } = await loadFixture(setupFixture);
		const pin = "1234";
		const pinArgoned = fsHash.argon(fsHash.hash(pin));
		const pinSalt = randomBytes(16);

		const commitment_pin = computeCommitment([pin, pinSalt.toString()]);

		const challengeSalt = randomBytes(16);
		const registerChallenge = generateRegisterChallenge(
			user.account.address,
			toHex(challengeSalt),
			pinArgoned,
		);

		const encSeedHex = `0x${toHex(enc_material.encSeed)}` as const;

		const txHash = await keyRegistry.write.registerKeygenData(
			[
				{
					nonce: `0x${toHex(nonce)}`,
					salt_pin: `0x${toHex(base_material.pinSalt)}`,
					salt_auth: `0x${toHex(base_material.authSalt)}`,
					salt_wrap: `0x${toHex(base_material.wrapperSalt)}`,
					seed_head: sliceHex(encSeedHex, 0, 20),
					seed_word: sliceHex(encSeedHex, 20, 52),
					seed_tail: sliceHex(encSeedHex, 52, 72),
					commitment_pin,
				},
				`0x${toHex(publicKey)}`,
			],
			{ account: user.account },
		);

		await admin.waitForTransactionReceipt({ hash: txHash });

		const [
			stored_salt_auth,
			stored_salt_wrap,
			stored_salt_pin,
			stored_nonce,
			stored_seed_head,
			stored_seed_word,
			stored_seed_tail,
		] = await keyRegistry.read.keygenData([user.account.address]);

		const stored = {
			salt_auth: toB64(stored_salt_auth),
			salt_wrap: toB64(stored_salt_wrap),
			salt_pin: toB64(stored_salt_pin),
			nonce: toB64(stored_nonce),
			seed: toB64(
				concatHex([stored_seed_head, stored_seed_word, stored_seed_tail]),
			),
		};

		const regenerated_challenge = generateRegisterChallenge(
			user.account.address,
			version.toString(),
			stored.nonce,
		);

		const regenerated_signature = await user.signMessage({
			message: regenerated_challenge.challenge,
		});

		const regenerated = regenerateEncryptionKey(
			regenerated_signature,
			pin,
			stored.salt_pin,
			stored.salt_auth,
			stored.salt_wrap,
			stored.seed,
			"test",
		);

		expect(regenerated.encryptionKey).to.equal(generated.encryptionKey);
	});
});
