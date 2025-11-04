import { computeCidIdentifier, eip712signature } from "@filosign/contracts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import z from "zod";
import { useFilosignContext } from "../../context/FilosignProvider";

export function useAckFile() {
	const { contracts, wallet, api } = useFilosignContext();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (args: { pieceCid: string }) => {
			const { pieceCid } = args;

			if (!contracts || !wallet) {
				throw new Error("not connected");
			}

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

			const timestamp = Math.floor(Date.now() / 1000);

			const signature = await eip712signature(contracts, "FSFileRegistry", {
				types: {
					AckFile: [
						{ name: "cidIdentifier", type: "bytes32" },
						{ name: "sender", type: "address" },
						{ name: "recipient", type: "address" },
						{ name: "timestamp", type: "uint256" },
					],
				},
				primaryType: "AckFile",
				message: {
					cidIdentifier,
					sender,
					recipient,
					timestamp: BigInt(timestamp),
				},
			});

			const ackResponse = await api.rpc.postSafe({}, `/files/${pieceCid}/ack`, {
				signature,
				timestamp: timestamp,
			});

			if (!ackResponse.success) {
				throw new Error("Failed to acknowledge file");
			}

			queryClient.refetchQueries({ queryKey: ["fsQ-file-info", pieceCid] });

			return ackResponse.success;
		},
	});
}
