import { computeCidIdentifier, eip712signature } from "@filosign/contracts";
import {
	encryption,
	jsonStringify,
	KEM,
	randomBytes,
	toBytes,
	toHex,
} from "@filosign/crypto-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Address } from "viem";
import z from "zod";
import { calculatePieceCid } from "../../../utils/piece";
import { useFilosignContext } from "../../context/FilosignProvider";
import { useUserProfileByQuery } from "../users";

export function useSendFile() {
	const { contracts, wallet, api } = useFilosignContext();
	const { data: user } = useUserProfileByQuery({
		address: wallet?.account.address,
	});

	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (args: {
			recipient: { address: Address; encryptionPublicKey: string };
			bytes: Uint8Array;
			signaturePositionOffset: {
				top: number;
				left: number;
			};
			metadata: {
				name: string;
				mimeType: string;
			};
		}) => {
			const { recipient, bytes, signaturePositionOffset, metadata } = args;
			const timestamp = Math.floor(Date.now() / 1000);
			const encoder = new TextEncoder();

			if (!contracts || !wallet || !user) {
				throw new Error("not conected iido");
			}

			const data = encoder.encode(
				jsonStringify({
					fileBytes: bytes,
					sender: wallet.account.address,
					timestamp,
					signaturePositionOffset,
					metadata,
				}),
			);

			const encryptionKey = randomBytes(32);

			const encryptionInfo = "ignore-encryption-info";

			const encryptedData = await encryption.encrypt({
				message: data,
				secretKey: encryptionKey,
				info: encryptionInfo,
			});

			const pieceCid = calculatePieceCid(encryptedData);

			const { ciphertext: recipientKemCiphertext, sharedSecret: ssKEM } =
				await KEM.encapsulate({
					publicKeyOther: toBytes(recipient.encryptionPublicKey),
				});
			const recipientEncryptedEncryptionKey = await encryption.encrypt({
				message: encryptionKey,
				secretKey: ssKEM,
				info: `${pieceCid.toString()}:${recipient.address}`,
			});

			const { ciphertext: selfKemCiphertext, sharedSecret: sKEM } =
				await KEM.encapsulate({
					publicKeyOther: toBytes(user.encryptionPublicKey),
				});
			const selfEncryptedEncryptionKey = await encryption.encrypt({
				message: encryptionKey,
				secretKey: sKEM,
				info: `${pieceCid.toString()}:${wallet.account.address}`,
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
						{ name: "recipient", type: "address" },
						{ name: "timestamp", type: "uint256" },
						{ name: "nonce", type: "uint256" },
					],
				},
				primaryType: "RegisterFile",
				message: {
					cidIdentifier: cidIdentifier,
					sender: wallet.account.address,
					recipient: recipient.address,
					timestamp: BigInt(timestamp),
					nonce: BigInt(nonce),
				},
			});

			const requestPayload = {
				sender: wallet.account.address,
				recipient: recipient.address,
				pieceCid: pieceCid.toString(),
				signature,
				encryptedEncryptionKey: toHex(recipientEncryptedEncryptionKey),
				senderEncryptedEncryptionKey: toHex(selfEncryptedEncryptionKey),
				kemCiphertext: toHex(recipientKemCiphertext),
				senderKemCiphertext: toHex(selfKemCiphertext),
				timestamp: timestamp,
				nonce: Number(nonce),
			};

			const registerResponse = await api.rpc.postSafe(
				{},
				"/files",
				requestPayload,
			);

			queryClient.invalidateQueries({ queryKey: ["sent-files"] });

			return registerResponse.success;
		},
	});
}
