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
                    status: zHexString(),
                    onchainTxHash: zHexString(),
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
