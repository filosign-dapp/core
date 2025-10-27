import { useMutation, useQuery } from "@tanstack/react-query";
import { useWalletClient } from "wagmi";
import { encryption, walletKeyGen } from "../../../crypto-utils/src/lib-node";
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
	const { api, contracts, wallet } = useFilosignContext();

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

				const success = await api.rpc.tx(tx, {
					encryptionPublicKey: keygenData.kemKeypair.publicKey,
					signaturePublicKey: keygenData.sigKeypair.publicKey,
				});

				if (!success) {
					throw new Error("Failed to register keygen data");
				}
			} else {
				const [saltPin, saltSeed, saltChallenge, commitmentKem, commitmentSig] =
					await contracts.FSKeyRegistry.read.keygenData([
						wallet.account.address,
					]);

				const keygenData = await walletKeyGen(wallet, {
					pin,
					salts: {
						challenge: saltChallenge,
						seed: saltSeed,
						pin: saltPin,
					},
				});

				if (
					commitmentKem !== keygenData.commitmentKem ||
					commitmentSig !== keygenData.commitmentSig
				) {
					throw new Error("Invalid PIN");
				}
			}
		},
	});
}

export function useLogout() {}
