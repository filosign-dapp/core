import { seedKeyGen, walletKeyGen } from "@filosign/crypto-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Address } from "viem";
import { idb } from "../../utils/idb";
import { DAY, MINUTE } from "../constants";
import { useFilosignContext } from "../context/FilosignProvider";

export function useApproveSender() {
	const { contracts, wallet, api } = useFilosignContext();

	return useMutation({
		mutationFn: async (sender: Address) => {
			if (!contracts || !wallet) {
				throw new Error("not conected iido");
			}

			const tx = await contracts.FSManager.write.approveSender([sender]);
			const success = await api.rpc.tx(tx, {});

			if (!success) {
				throw new Error("Failed sverer to know you approve sender");
			}
		},
	});
}

export function useRevokeSender() {
	const { contracts, wallet, api } = useFilosignContext();

	return useMutation({
		mutationFn: async (sender: Address) => {
			if (!contracts || !wallet) {
				throw new Error("not conected iido");
			}

			const tx = await contracts.FSManager.write.revokeSender([sender]);
			const success = await api.rpc.tx(tx, {});

			if (!success) {
				throw new Error("Failed sverer to know you revoke sender");
			}
		},
	});
}

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

export function useCanReceiveFrom(sender: Address) {
	const { contracts, wallet } = useFilosignContext();

	return useQuery({
		queryKey: ["fsQ-is-approved", sender, wallet?.account.address],
		queryFn: async () => {
			if (!contracts || !wallet) return false;
			const isApproved = await contracts.FSManager.read.approvedSenders([
				wallet.account.address,
				sender,
			]);
			return isApproved;
		},
		enabled: !!wallet && !!contracts,
	});
}
