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

                const downloadResponse = await fetch(presignedUrl, {
                    method: "GET",
                });

                if (!downloadResponse.ok) {
                    throw new Error("Failed to fetch file from S3");
                }

                data = new Uint8Array(await downloadResponse.arrayBuffer());
                console.log({ data });
            } else {
                const filecoinUrl = `https://0xcd4e9682172f67f2ea8cf0a9ecf199f3b78e57ad.calibration.filbeam.io/${pieceCid}`;
                console.log("Fetching from Filecoin:", filecoinUrl);

                const fileResponse = await fetch(filecoinUrl);

                console.log("Filecoin response status:", fileResponse.status);
                console.log("Filecoin response headers:", fileResponse.headers);

                if (!fileResponse.ok) {
                    const errorText = await fileResponse.text();
                    console.error("Filecoin error response:", errorText);
                    throw new Error(`Failed to fetch file from Filecoin: ${fileResponse.status} - ${errorText}`);
                }

                const arrayBuffer = await fileResponse.arrayBuffer();
                console.log("Filecoin arrayBuffer size:", arrayBuffer.byteLength);

                data = new Uint8Array(arrayBuffer);
                console.log("Filecoin data length:", data.length);
            }

            console.log("Starting decryption process...");

            const keyStore = idb({
                db: wallet.account.address,
                store: "fs-keystore",
            });
            const keySeed = await keyStore.secret.get("key-seed");
            console.log("Key seed found:", !!keySeed);
            if (!keySeed) throw new Error("No key seed found in keystore");

            const { privateKey } = await KEM.keyGen({ seed: keySeed });
            console.log("KEM private key generated");

            console.log("KEM ciphertext input:", kemCiphertext);
            const { sharedSecret: ssE } = await KEM.decapsulate({
                ciphertext: toBytes(kemCiphertext),
                privateKeySelf: privateKey,
            });
            console.log("KEM decapsulation successful, sharedSecret length:", ssE.length);

            console.log("Encrypted encryption key:", encryptedEncryptionKey);
            const encryptionKey = await encryption.decrypt({
                ciphertext: toBytes(encryptedEncryptionKey),
                secretKey: ssE,
                info: `${pieceCid}:${wallet.account.address}`,
            });
            console.log("Encryption key decrypted, length:", encryptionKey.length);

            const encryptionInfo = "ignore-encryption-info";
            console.log("Starting final decryption, data length:", data.length);

            const decryptedData = await encryption.decrypt({
                ciphertext: data,
                secretKey: encryptionKey,
                info: encryptionInfo,
            });
            console.log("Final decryption successful, decryptedData length:", decryptedData.length);

            const decoder = new TextDecoder();
            const jsonString = decoder.decode(decryptedData);
            console.log("JSON string (first 200 chars):", jsonString.substring(0, 200));

            const { fileBytes, ...parsedData } = jsonParse(jsonString);
            console.log("Parsed fileBytes type:", typeof fileBytes, "isArray:", Array.isArray(fileBytes));

            // Handle case where fileBytes was serialized as an object with numeric keys
            let fileBytesArray: number[];
            if (Array.isArray(fileBytes)) {
                fileBytesArray = fileBytes;
            } else if (typeof fileBytes === 'object' && fileBytes !== null) {
                // Convert object with numeric string keys back to array
                const maxIndex = Math.max(...Object.keys(fileBytes).map(k => parseInt(k)));
                fileBytesArray = new Array(maxIndex + 1);
                for (let i = 0; i <= maxIndex; i++) {
                    fileBytesArray[i] = fileBytes[i] || 0;
                }
            } else {
                throw new Error("Invalid fileBytes format");
            }

            console.log("Converted fileBytesArray length:", fileBytesArray.length);

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
                fileBytes: new Uint8Array(fileBytesArray),
            };
        },
    });
}
