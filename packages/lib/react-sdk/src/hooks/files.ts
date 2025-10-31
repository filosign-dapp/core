import { eip712signature } from "@filosign/contracts";
import { encryption, KEM, toBytes, toHex } from "@filosign/crypto-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Address } from "viem";
import z from "zod";
import { idb } from "../../utils/idb";
import { calculatePieceCid } from "../../utils/piece";
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

			const signature = eip712signature(contracts, "FSFileRegistry", {
				types: {
					RegisterFile: [
						{ name: "sender", type: "address" },
						{ name: "recipient", type: "address" },
						{ name: "pieceCid", type: "string" },
						{ name: "kemCiphertext", type: "bytes" },
						{ name: "timestamp", type: "uint256" },
						{ name: "nonce", type: "uint256" },
					],
				},
				primaryType: "RegisterFile",
				message: {
					sender: wallet.account.address,
					recipient,
					pieceCid,
					kemCiphertext,
					timestamp: Date.now(),
					nonce: Math.floor(Math.random() * 1000000),
				},
			});

			const registerResponse = await api.rpc.postSafe({}, "/files", {
				sender: wallet.account.address,
				recipient: recipient.address,
				pieceCid: pieceCid.toString(),
				signature,
				kemCiphertext: toHex(kemCiphertext),
				timestamp: Date.now(),
				nonce: Math.floor(Math.random() * 1000000),
			});

			return registerResponse.success;
		},
	});
}

export function useViewFile() {
	const { contracts, wallet, api } = useFilosignContext();

	// TODO invalidate and refetch files
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (args: {
			recipient: { address: Address; encryptionPublicKey: string };
			data: Uint8Array;
		}) => {
			const { sender, data } = args;

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

			const signature = eip712signature(contracts, "FSFileRegistry", {
				types: {
					RegisterFile: [
						{ name: "sender", type: "address" },
						{ name: "recipient", type: "address" },
						{ name: "pieceCid", type: "string" },
						{ name: "kemCiphertext", type: "bytes" },
						{ name: "timestamp", type: "uint256" },
						{ name: "nonce", type: "uint256" },
					],
				},
				primaryType: "RegisterFile",
				message: {
					sender: wallet.account.address,
					recipient,
					pieceCid,
					kemCiphertext,
					timestamp: Date.now(),
					nonce: Math.floor(Math.random() * 1000000),
				},
			});

			const registerResponse = await api.rpc.postSafe({}, "/files", {
				sender: wallet.account.address,
				recipient: recipient.address,
				pieceCid: pieceCid.toString(),
				signature,
				kemCiphertext: toHex(kemCiphertext),
				timestamp: Date.now(),
				nonce: Math.floor(Math.random() * 1000000),
			});

			return registerResponse.success;
		},
	});
}
