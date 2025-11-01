import { computeCidIdentifier, eip712signature } from "@filosign/contracts";
import {
    encryption,
    jsonStringify,
    KEM,
    randomBytes,
    toBytes,
    toHex,
} from "@filosign/crypto-utils";
import { calculate as calculatePieceCid } from "@filoz/synapse-sdk/piece";
import { useMutation } from "@tanstack/react-query";
import type { Address } from "viem";
import z from "zod";
import { idb } from "../../../utils/idb";
import { useFilosignContext } from "../../context/FilosignProvider";

export function useSendFile() {
    const { contracts, wallet, api } = useFilosignContext();

    // TODO invalidate and refetch files
    // const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (args: {
            sender: { address: Address; encryptionPublicKey: string };
            signatureBytes: Uint8Array;
            signaturePositionOffset: {
                top: number;
                left: number;
            };
        }) => {
            const { sender, signatureBytes, signaturePositionOffset } = args;
            const timestamp = Math.floor(Date.now() / 1000);
            const encoder = new TextEncoder();

            if (!contracts || !wallet) {
                throw new Error("not conected iido");
            }

            const keyStore = idb({
                db: wallet.account.address,
                store: "fs-keystore",
            });
            const keySeed = await keyStore.secret.get("key-seed");
            if (!keySeed) throw new Error("No key seed found in keystore");

            const data = encoder.encode(
                jsonStringify({
                    fileBytes: bytes,
                    sender: wallet.account.address,
                    timestamp: timestamp,
                    signaturePositionOffset: signaturePositionOffset,
                }),
            );

            const pieceCid = calculatePieceCid(data);

            const encryptionKey = randomBytes(32);

            const encryptedData = await encryption.encrypt({
                message: data,
                secretKey: encryptionKey,
                info: pieceCid.toString(),
            });

            const { ciphertext: kemCiphertext, sharedSecret: ssKEM } =
                await KEM.encapsulate({
                    publicKeyOther: toBytes(recipient.encryptionPublicKey),
                });

            const encryptedEncryptionKey = await encryption.encrypt({
                message: encryptionKey,
                secretKey: ssKEM,
                info: `${pieceCid.toString()}:${wallet.account.address}>${recipient.address}`,
            });

            const uploadStartResponse = await api.rpc.postSafe(
                {
                    uploadUrl: z.string(),
                },
                "/files/upload/start",
                {
                    pieceCid: pieceCid.toString(),
                },
            );
            const uploadResponse = await fetch(uploadStartResponse.data.uploadUrl, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/octet-stream",
                },
                body: encryptedData,
            });

            if (!uploadResponse.ok) {
                console.error("bhai S3 upload failed:", {
                    status: uploadResponse.status,
                    statusText: uploadResponse.statusText,
                });
                throw new Error(`Upload failed: ${uploadResponse.statusText}`);
            }

            const nonce = await contracts.FSFileRegistry.read.nonce([
                wallet.account.address,
            ]);

            const cidIdentifier = computeCidIdentifier(pieceCid.toString());

            const signature = await eip712signature(contracts, "FSFileRegistry", {
                types: {
                    RegisterFile: [
                        { name: "cidIdentifier", type: "bytes32" },
                        { name: "sender", type: "address" },
                        { name: "receipient", type: "address" },
                        { name: "timestamp", type: "uint256" },
                        { name: "nonce", type: "uint256" },
                    ],
                },
                primaryType: "RegisterFile",
                message: {
                    cidIdentifier: cidIdentifier,
                    sender: wallet.account.address,
                    receipient: recipient.address,
                    timestamp: BigInt(timestamp),
                    nonce: BigInt(nonce),
                },
            });

            const registerResponse = await api.rpc.postSafe({}, "/files", {
                sender: wallet.account.address,
                recipient: recipient.address,
                pieceCid: pieceCid.toString(),
                signature,
                encryptedEncryptionKey: toHex(encryptedEncryptionKey),
                kemCiphertext: toHex(kemCiphertext),
                timestamp: timestamp,
                nonce: Number(nonce),
            });

            return registerResponse.success;
        },
    });
}
