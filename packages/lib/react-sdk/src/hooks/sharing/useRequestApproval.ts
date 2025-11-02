import { useMutation } from "@tanstack/react-query";
import type { Address } from "viem";
import { z } from "zod";
import { useFilosignContext } from "../../context/FilosignProvider";

export function useRequestApproval() {
    const { wallet, api } = useFilosignContext();

    return useMutation({
        mutationFn: async ({ recipientWallet, message }: { recipientWallet: Address; message?: string }) => {
            if (!wallet) {
                throw new Error("Wallet not connected");
            }

            const messageToSign = `Request sharing permission from ${recipientWallet}`;
            const signature = await wallet.signMessage({ message: messageToSign });

            const response = await api.rpc.postSafe(
                {
                    id: z.string(),
                    senderWallet: z.string(),
                    recipientWallet: z.string(),
                    message: z.string().nullable(),
                    status: z.string(),
                    createdAt: z.string(),
                },
                "/sharing/request",
                {
                    recipientWallet,
                    message: message || null,
                    signature,
                }
            );

            return response.data;
        },
    });
}
