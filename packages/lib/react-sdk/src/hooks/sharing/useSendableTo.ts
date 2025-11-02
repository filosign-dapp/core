import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { useFilosignContext } from "../../context/FilosignProvider";

export function useSendableTo() {
    const { api } = useFilosignContext();

    return useQuery({
        queryKey: ["sendable-to"],
        queryFn: async () => {
            const response = await api.rpc.getSafe(
                {
                    approvals: z.array(z.object({
                        recipientWallet: z.string(),
                        active: z.boolean(),
                        createdAt: z.string(),
                    })),
                },
                "/sharing/sendable-to"
            );
            return response.data.approvals;
        },
        enabled: !!api,
    });
}