import { zHexString } from "@filosign/shared/zod";
import { useQuery } from "@tanstack/react-query";
import z from "zod";
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
					onchainTxHash: zHexString(),
					createdAt: z.string(),
					signers: z.array(z.string()),
					viewers: z.array(z.string()),
					signatures: z.array(
						z.object({
							signer: z.string(),
							timestamp: z.number(),
							onchainTxHash: zHexString(),
						}),
					),
					kemCiphertext: zHexString().nullable(),
					encryptedEncryptionKey: zHexString().nullable(),
				},
				`/files/${args.pieceCid}`,
			);

			return response.data;
		},
		enabled: !!args.pieceCid,
	});
}
