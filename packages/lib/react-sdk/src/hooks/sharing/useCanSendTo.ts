import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import { MINUTE } from "../../constants";
import { useFilosignContext } from "../../context/FilosignProvider";

export function useCanSendTo(receiver: Address) {
    const { contracts, wallet } = useFilosignContext();

    return useQuery({
        queryKey: ["fsQ-is-approved", receiver, wallet?.account.address],
        queryFn: async () => {
            if (!contracts || !wallet) return false;
            const isApproved = await contracts.FSManager.read.approvedSenders([
                receiver,
                wallet.account.address,
            ]);
            return isApproved;
        },
        enabled: !!wallet && !!contracts,
        staleTime: 5 * MINUTE,
    });
}
