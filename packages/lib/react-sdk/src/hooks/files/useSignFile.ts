import { computeCidIdentifier, eip712signature } from "@filosign/contracts";
import {
    computeCommitment,
    hash as fsHash,
    seedKeyGen,
    signatures,
    toBytes,
    toHex,
} from "@filosign/crypto-utils";
import { useMutation } from "@tanstack/react-query";
import z from "zod";
import { idb } from "../../../utils/idb";
import { useFilosignContext } from "../../context/FilosignProvider";

export function useSignFile() {
    const { contracts, wallet, api, wasm } = useFilosignContext();

    return useMutation({
        mutationFn: async (args: {
            pieceCid: string;
            signatureBytes: Uint8Array;
        }) => {
            const { pieceCid, signatureBytes } = args;
            const timestamp = Math.floor(Date.now() / 1000);

            if (!contracts || !wallet || !wasm.dilithium) {
                throw new Error("not connected");
            }

            const keyStore = idb({
                db: wallet.account.address,
                store: "fs-keystore",
            });
            const keySeed = await keyStore.secret.get("key-seed");
            if (!keySeed) throw new Error("No key seed found in keystore");

            const keygenData = await seedKeyGen(keySeed, { dl: wasm.dilithium });

            const fileResponse = await api.rpc.getSafe(
                {
                    pieceCid: z.string(),
                    sender: z.string(),
                    status: z.string(),
                    createdAt: z.string(),
                    recipient: z.string(),
                },
                `/files/${pieceCid}`,
            );

            if (!fileResponse.success) {
                throw new Error("Failed to fetch file info");
            }

            const { sender, recipient } = fileResponse.data;

            if (recipient !== wallet.account.address) {
                throw new Error("You are not the recipient of this file");
            }

            const cidIdentifier = computeCidIdentifier(pieceCid);

            const nonce = await contracts.FSFileRegistry.read.nonce([
                wallet.account.address,
            ]);

            const signatureVisualHash = fsHash.digest(signatureBytes);
            const dl3SignatureCommitment = computeCommitment([toHex(signatureBytes)]);

            const signature = await eip712signature(contracts, "FSFileRegistry", {
                types: {
                    SignFile: [
                        { name: "cidIdentifier", type: "bytes32" },
                        { name: "sender", type: "address" },
                        { name: "recipient", type: "address" },
                        { name: "signatureVisualHash", type: "bytes32" },
                        { name: "dl3SignatureCommitment", type: "bytes20" },
                        { name: "timestamp", type: "uint256" },
                        { name: "nonce", type: "uint256" },
                    ],
                },
                primaryType: "SignFile",
                message: {
                    cidIdentifier,
                    sender,
                    recipient,
                    signatureVisualHash,
                    dl3SignatureCommitment,
                    timestamp: BigInt(timestamp),
                    nonce: BigInt(nonce),
                },
            });

            const message = [
                sender,
                pieceCid,
                recipient,
                signatureVisualHash,
                dl3SignatureCommitment,
                BigInt(timestamp),
                BigInt(nonce),
                signature,
            ] as const;

            const dl3Signature = await signatures.sign({
                dl: wasm.dilithium,
                message: toBytes(computeCommitment(message)),
                privateKey: keygenData.sigKeypair.privateKey,
            });

            const signResponse = await api.rpc.postSafe({}, `/files/${pieceCid}/sign`, {
                signature,
                timestamp: timestamp,
                signatureVisualBytes: toHex(signatureBytes),
                dl3Signature: toHex(dl3Signature),
            });

            return signResponse.success;
        },
    });
}
