import { eq } from "drizzle-orm";
import { decodeEventLog, type Hash, isHex } from "viem";
import db from "../db";
import { evmClient, fsContracts } from "../evm";

const { FSKeyRegistry, FSManager } = fsContracts;

export async function processTransaction(
    txHash: Hash,
    data: Record<string, unknown>,
) {
    const receipt = await evmClient.waitForTransactionReceipt({ hash: txHash });

    if (!receipt) {
        throw new Error(`Transaction receipt not found for hash: ${txHash}`);
    }

    if ([receipt.contractAddress?.toLowerCase(), receipt.to?.toLowerCase()].includes(FSKeyRegistry.address.toLowerCase())) {
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

                try {
                    await db.insert(db.schema.users).values({
                        walletAddress: log.args.user,
                        encryptionPublicKey,
                        signaturePublicKey,

                        lastActiveAt: new Date(),
                        keygenDataJson: ({
                            saltPin: keygenData[0],
                            saltSeed: keygenData[1],
                            saltChallenge: keygenData[2],
                            commitmentKem: keygenData[3],
                            commitmentSig: keygenData[4],
                        }),
                    });
                } catch (error) {
                    console.error(`Error inserting user: ${error}`);
                    throw error;
                }
            }
        }
    }

    if ([receipt.contractAddress?.toLowerCase(), receipt.to?.toLowerCase()].includes(FSManager.address.toLowerCase())) {
        for (const encodedLog of receipt.logs) {
            try {
                const log = decodeEventLog({
                    abi: FSManager.abi,
                    topics: encodedLog.topics,
                    data: encodedLog.data,
                });

                if (log.eventName === "SenderApproved") {
                    if (!encodedLog.transactionHash) {
                        continue;
                    }

                    // Check if both recipient and sender exist in users table
                    const [recipientExists] = await db
                        .select()
                        .from(db.schema.users)
                        .where(eq(db.schema.users.walletAddress, log.args.recipient))
                        .limit(1);

                    const [senderExists] = await db
                        .select()
                        .from(db.schema.users)
                        .where(eq(db.schema.users.walletAddress, log.args.sender))
                        .limit(1);

                    if (!recipientExists || !senderExists) {
                        continue;
                    }

                    await db.insert(db.schema.shareApprovals).values({
                        recipientWallet: log.args.recipient,
                        senderWallet: log.args.sender,
                        txHash: encodedLog.transactionHash,
                        active: true,
                    });
                }

                if (log.eventName === "SenderRevoked") {
                    // Check if both recipient and sender exist in users table
                    const [recipientExists] = await db
                        .select()
                        .from(db.schema.users)
                        .where(eq(db.schema.users.walletAddress, log.args.recipient))
                        .limit(1);

                    const [senderExists] = await db
                        .select()
                        .from(db.schema.users)
                        .where(eq(db.schema.users.walletAddress, log.args.sender))
                        .limit(1);

                    if (!recipientExists || !senderExists) {
                        continue;
                    }

                    await db.insert(db.schema.shareApprovals).values({
                        recipientWallet: log.args.recipient,
                        senderWallet: log.args.sender,
                        active: false,
                        txHash: txHash,
                    });
                }
            } catch (error) {
                // Silently ignore decode errors
            }
        }
    }
}
