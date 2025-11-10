import { useQuery } from "@tanstack/react-query";
import z from "zod";
import { zHexString } from "../../../utils/zod";
import { useFilosignContext } from "../../context/FilosignProvider";

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
					acked: z.boolean(),
					ackedAt: z.string().nullable(),
					onchainTxHash: zHexString(),
					senderEncryptedEncryptionKey: z.string().nullable(),
					createdAt: z.string(),
					recipient: z.string(),
					kemCiphertext: z.string().nullable(),
					senderKemCiphertext: z.string().nullable(),
					encryptedEncryptionKey: z.string().nullable(),
					signatures: z
						.object({
							signer: z.string(),
							evmSignature: zHexString(),
							dl3Signature: zHexString(),
							timestamp: z.number(),
							onchainTxHash: zHexString(),
						})
						.array(),
				},
				`/files/${args.pieceCid}`,
			);

			return response.data;
		},
		enabled: !!args.pieceCid,
	});
}
