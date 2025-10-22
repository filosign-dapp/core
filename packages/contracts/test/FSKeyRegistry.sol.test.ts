import {
	computeCommitment,
	hash as fsHash,
	generateRegisterChallenge,
	hkdfExtractExpand,
	KEM,
	randomBytes,
	signatures,
	toBytes,
	toHex,
} from "@filosign/crypto-utils/node";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { describe, it } from "mocha";
import {
	concatBytes,
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

		await keyRegistry.write.registerKeygenData([salpin]);
	});
});
