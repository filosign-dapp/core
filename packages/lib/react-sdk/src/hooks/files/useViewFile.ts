import {
    encryption,
    jsonParse,
    KEM,
    toBytes
} from "@filosign/crypto-utils";
import { RPC_URLS, Synapse } from "@filoz/synapse-sdk";
import { useMutation } from "@tanstack/react-query";
import z from "zod";
import { idb } from "../../../utils/idb";
import { useFilosignContext } from "../../context/FilosignProvider";

export function useViewFile() {
    const { contracts, wallet, api } = useFilosignContext();

    // TODO invalidate and refetch files
    // const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (args: {
            pieceCid: string;
            kemCiphertext: string;
            encryptedEncryptionKey: string;
            status: "s3" | "foc";
        }) => {
            const { pieceCid, kemCiphertext, encryptedEncryptionKey, status } = args;

            if (!contracts || !wallet) {
                throw new Error("not conected iido");
            }

            let data: Uint8Array;

            if (status === "s3") {
                const s3Response = await api.rpc.getSafe(
                    {
                        presignedUrl: z.string(),
                    },
                    `/files/${pieceCid}/s3`,
                );

                if (!s3Response.success) {
                    throw new Error("Failed to fetch file from S3");
                }

                const { presignedUrl } = s3Response.data;

                const uploadResponse = await fetch(presignedUrl, {
                    method: "GET",
                });

                if (!uploadResponse.ok) {
                    throw new Error("Failed to fetch file from S3");
                }

                data = new Uint8Array(await uploadResponse.arrayBuffer());
            } else {
                const synapse = await Synapse.create({
                    privateKey: "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e",
                    rpcURL: RPC_URLS.calibration.websocket,
                });

                const fileResponse = await synapse.storage.download(pieceCid, {
                    withCDN: true,
                });

                if (!fileResponse) {
                    throw new Error("Failed to fetch file");
                }

                data = fileResponse;
            }

            const keyStore = idb({
                db: wallet.account.address,
                store: "fs-keystore",
            });
            const keySeed = await keyStore.secret.get("key-seed");
            if (!keySeed) throw new Error("No key seed found in keystore");

            const { privateKey } = await KEM.keyGen({ seed: keySeed });
            const { sharedSecret: ssE } = await KEM.decapsulate({
                ciphertext: toBytes(kemCiphertext),
                privateKeySelf: privateKey,
            });

            const encryptionKey = await encryption.decrypt({
                ciphertext: toBytes(encryptedEncryptionKey),
                secretKey: ssE,
                info: `${pieceCid}:${wallet.account.address}`,
            });

            const decryptedData = await encryption.decrypt({
                ciphertext: data,
                secretKey: encryptionKey,
                info: pieceCid,
            });

            const decoder = new TextDecoder();
            const jsonString = decoder.decode(decryptedData);
            const { fileBytes, ...parsedData } = jsonParse(jsonString);

            z.object({
                sender: z.string(),
                timestamp: z.number(),
                signaturePositionOffset: z.object({
                    top: z.number(),
                    left: z.number(),
                }),
            }).parse(parsedData);

            return {
                ...parsedData,
                fileBytes: new Uint8Array(fileBytes),
            };
        },
    });
}
