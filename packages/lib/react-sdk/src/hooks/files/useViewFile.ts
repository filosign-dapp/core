import { encryption, jsonParse, KEM, toBytes } from "@filosign/crypto-utils";
import { useMutation } from "@tanstack/react-query";
import z from "zod";
import { idb } from "../../../utils/idb";
import { useFilosignContext } from "../../context/FilosignProvider";

export function useViewFile() {
	const { contracts, wallet, api, runtime } = useFilosignContext();

	return useMutation({
		mutationFn: async (args: {
			pieceCid: string;
			kemCiphertext: string;
			encryptedEncryptionKey: string;
			status: "s3" | "foc";
		}) => {
			const { pieceCid, kemCiphertext, encryptedEncryptionKey, status } = args;

			if (!contracts || !wallet || !runtime) {
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
			} else {
				const filecoinUrl = `https://${runtime.serverAddressSynapse}.calibration.filbeam.io/${pieceCid}`;

				const fileResponse = await fetch(filecoinUrl);

				if (!fileResponse.ok) {
					const errorText = await fileResponse.text();
					console.error("Filecoin error response:", errorText);
					throw new Error(
						`Failed to fetch file from Filecoin: ${fileResponse.status} - ${errorText}`,
					);
				}

				const arrayBuffer = await fileResponse.arrayBuffer();

				data = new Uint8Array(arrayBuffer);
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

			const encryptionInfo = "ignore-encryption-info";

			const decryptedData = await encryption.decrypt({
				ciphertext: data,
				secretKey: encryptionKey,
				info: encryptionInfo,
			});

			const decoder = new TextDecoder();
			const jsonString = decoder.decode(decryptedData);

			const { fileBytes, ...parsedData } = jsonParse(jsonString);

			// Handle case where fileBytes was serialized as an object with numeric keys
			let fileBytesArray: number[];
			if (Array.isArray(fileBytes)) {
				fileBytesArray = fileBytes;
			} else if (typeof fileBytes === "object" && fileBytes !== null) {
				// Convert object with numeric string keys back to array
				const maxIndex = Math.max(
					...Object.keys(fileBytes).map((k) => parseInt(k, 10)),
				);
				fileBytesArray = new Array(maxIndex + 1);
				for (let i = 0; i <= maxIndex; i++) {
					fileBytesArray[i] = fileBytes[i] || 0;
				}
			} else {
				throw new Error("Invalid fileBytes format");
			}

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
