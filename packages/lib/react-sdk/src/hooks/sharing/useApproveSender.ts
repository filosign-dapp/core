import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Address } from "viem";
import { useFilosignContext } from "../../context/FilosignProvider";

export function useApproveSender() {
	const { contracts, wallet, api } = useFilosignContext();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (args: { sender: Address }) => {
			const { sender } = args;

			if (!contracts || !wallet) {
				throw new Error("not conected iido");
			}

			const tx = await contracts.FSManager.write.approveSender([sender]);
			const success = await api.rpc.tx(tx, {});

			if (!success) {
				throw new Error("Failed sverer to know you approve sender");
			}

			queryClient.refetchQueries({
				queryKey: ["fsQ-is-approved", wallet?.account.address, sender],
			});
		},
	});
}
