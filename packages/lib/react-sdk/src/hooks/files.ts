import { computeCidIdentifier, eip712signature } from "@filosign/contracts";
import { encryption, KEM, toBytes, toHex } from "@filosign/crypto-utils";
import { Synapse } from "@filoz/synapse-sdk";
import { calculate as calculatePieceCid } from "@filoz/synapse-sdk/piece";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Address } from "viem";
import z from "zod";
import { idb } from "../../utils/idb";
import { useFilosignContext } from "../context/FilosignProvider";

export function useSendFile() {
	const { contracts, wallet, api } = useFilosignContext();

	// TODO invalidate and refetch files
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (args: {
			recipient: { address: Address; encryptionPublicKey: string };
			data: Uint8Array;
		}) => {
			const { recipient, data } = args;

			if (!contracts || !wallet) {
				throw new Error("not conected iido");
			}

			const keyStore = idb({
				db: wallet.account.address,
				store: "fs-keystore",
			});
			const keySeed = await keyStore.secret.get("key-seed");
			if (!keySeed) throw new Error("No key seed found in keystore");

			const { ciphertext: kemCiphertext, sharedSecret: ssA } =
				await KEM.encapsulate({
					publicKeyOther: toBytes(recipient.encryptionPublicKey),
				});

			const encryptedData = await encryption.encrypt({
				message: data,
				sharedSecret: ssA,
				info: "encryption info",
			});

			const pieceCid = calculatePieceCid(data);

			const uploadStartResponse = await api.rpc.postSafe(
				{
					uploadUrl: z.string(),
					key: z.string(),
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

			const nonce = await contracts.FSFileRegistry.read.nonce([wallet.account.address]);

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
					timestamp: BigInt(Date.now()),
					nonce: BigInt(nonce),
				},
			});

			const registerResponse = await api.rpc.postSafe({}, "/files", {
				sender: wallet.account.address,
				recipient: recipient.address,
				pieceCid: pieceCid.toString(),
				signature,
				kemCiphertext: toHex(kemCiphertext),
				timestamp: Math.floor(Date.now() / 1000),
				nonce: Number(nonce),
			});

			return registerResponse.success;
		},
	});
}

export function useFileInfo(args: { pieceCid: string | undefined }) {
	const { api } = useFilosignContext();

	return useQuery({
		queryKey: ["fsQ-file-info", args.pieceCid],
		queryFn: async () => {
			const response = await api.rpc.getSafe(
				{
					pieceCid: z.string(),
					sender: z.string(),
					status: z.string(),
					onchainTxHash: z.string(),
					createdAt: z.string(),
					kemCiphertext: z.string(),
				},
				`/files/${args.pieceCid}`,
			);

			if (!response.success) {
				throw new Error("Failed to fetch file info");
			}
			return response.data;
		},
		enabled: !!args.pieceCid,
	});
}

export function useViewFile() {
	const { contracts, wallet, api } = useFilosignContext();

	// TODO invalidate and refetch files
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (args: {
			pieceCid: string;
			kemCiphertext: string;
			status: "s3" | "foc";
		}) => {
			const { pieceCid, kemCiphertext, status } = args;

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
				const synapse = await Synapse.create({});

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

			const decryptedData = await encryption.decrypt({
				ciphertext: data,
				sharedSecret: ssE,
				info: "encryption info",
			});
			return decryptedData;
		},
	});
}
