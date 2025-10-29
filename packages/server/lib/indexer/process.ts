import { getContracts } from "@filosign/contracts";
import { eq } from "drizzle-orm";
import { decodeEventLog, type Hash, isHex } from "viem";
import db from "../db";
import { evmClient } from "../evm";

const { FSKeyRegistry } = getContracts({
	//@ts-expect-error
	client: evmClient,
	chainId: evmClient.chain.id,
});

export async function processTransaction(
	txHash: Hash,
	data: Record<string, unknown>,
) {
	const receipt = await evmClient.waitForTransactionReceipt({ hash: txHash });

	if (!receipt) {
		throw new Error(`Transaction receipt not found for hash: ${txHash}`);
	}
	if ([receipt.contractAddress, receipt.to].includes(FSKeyRegistry.address)) {
		for (const encodedLog of receipt.logs) {
			const log = decodeEventLog({
				abi: FSKeyRegistry.abi,
				topics: encodedLog.topics,
				data: encodedLog.data,
			});
			if (log.eventName === "KeygenDataRegistered") {
				const { encryptionPublicKey, signaturePublicKey } = data;

				if (
					typeof encryptionPublicKey !== "string" ||
					!isHex(encryptionPublicKey)
				) {
					throw new Error("Invalid encryption public key");
				}
				if (
					typeof signaturePublicKey !== "string" ||
					!isHex(signaturePublicKey)
				) {
					throw new Error("Invalid signature public key");
				}

				const keygenData = await FSKeyRegistry.read.keygenData([log.args.user]);

				const [exists] = await db
					.select()
					.from(db.schema.users)
					.where(eq(db.schema.users.walletAddress, log.args.user));
				if (exists) continue;

				await db.insert(db.schema.users).values({
					walletAddress: log.args.user,
					encryptionPublicKey: encryptionPublicKey,
					signaturePublicKey: signaturePublicKey,
					lastActiveAt: Date.now(),
					keygenDataJson: {
						saltPin: keygenData[0],
						saltSeed: keygenData[1],
						saltChallenge: keygenData[2],
						commitmentKem: keygenData[3],
						commitmentSig: keygenData[4],
					},
				});
			}
		}
	}
}
