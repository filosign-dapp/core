import { useMutation, useQuery } from "@tanstack/react-query";
import { useWalletClient } from "wagmi";
import { walletKeyGen } from "../../../crypto-utils/src/lib-node";
import { MINUTE } from "../constants";
import { useFilosignContext } from "../context/FilosignProvider";

export function useIsRegistered() {
	const { contracts, wallet } = useFilosignContext();

	return useQuery({
		queryKey: ["fsQ-is-registered", wallet?.account.address],
		queryFn: async () => {
			if (!contracts || !wallet) {
				throw new Error("unreachable");
			}

			const isRegistered = await contracts.FSKeyRegistry.read.isRegistered([
				wallet.account.address,
			]);
			return isRegistered;
		},
		staleTime: 5 * MINUTE,
		enabled: !!contracts,
	});
}

export function useLogin() {
	const { contracts, wallet } = useFilosignContext();

	const { data: isRegistered } = useIsRegistered();

	return useMutation({
		mutationKey: ["fsM-login"],
		mutationFn: async (params: { pin: string }) => {
			const { pin } = params;

			if (!contracts || !wallet) {
				throw new Error("unreachable");
			}

			if (!isRegistered) {
				const keygenData = await walletKeyGen(wallet, {
					pin,
				});

				const tx = await contracts.FSKeyRegistry.write.registerKeygenData([
					keygenData.saltPin,
					keygenData.saltSeed,
					keygenData.saltChallenge,
					keygenData.commitmentKem,
					keygenData.commitmentSig,
				]);
			} else {
			}

			const tx = await contracts.FSKeyRegistry.write.login([
				params.address,
				params.signature,
			]);
			return tx;
		},
	});
}

export function useLogout() {}
