import { toHex, walletKeyGen } from "@filosign/crypto-utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { idb } from "../../../utils/idb";
import { useFilosignContext } from "../../context/FilosignProvider";
import { useIsLoggedIn } from "./useIsLoggedIn";
import { useIsRegistered } from "./useIsRegistered";

export function useLogin() {
	const { api, contracts, wallet, wasm } = useFilosignContext();
	const queryClient = useQueryClient();

	const { data: isRegistered } = useIsRegistered();
	const { data: isLoggedIn } = useIsLoggedIn();

	return useMutation({
		mutationFn: async (params: { pin: string }) => {
			if (isLoggedIn) return true;

			const { pin } = params;

			if (!contracts || !wallet || !wasm.dilithium) {
				throw new Error("unreachable");
			}

			const keyStore = idb({
				db: wallet.account.address,
				store: "fs-keystore",
			});

			if (!isRegistered) {
				const keygenData = await walletKeyGen(wallet, {
					pin,
					dl: wasm.dilithium,
				});

				const tx = await contracts.FSKeyRegistry.write.registerKeygenData([
					keygenData.saltPin,
					keygenData.saltSeed,
					keygenData.saltChallenge,
					keygenData.commitmentKem,
					keygenData.commitmentSig,
				]);

				const success = await api.rpc.tx(tx, {
					encryptionPublicKey: toHex(keygenData.kemKeypair.publicKey),
					signaturePublicKey: toHex(keygenData.sigKeypair.publicKey),
				});

				if (!success) {
					throw new Error("Failed to register keygen data");
				}

				await keyStore.secret.put("key-seed", new Uint8Array(keygenData.seed));
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
					dl: wasm.dilithium,
				});

				if (
					commitmentKem !== keygenData.commitmentKem ||
					commitmentSig !== keygenData.commitmentSig
				) {
					throw new Error("Invalid PIN");
				}

				await keyStore.secret.put("key-seed", new Uint8Array(keygenData.seed));
			}

			queryClient
				.refetchQueries({
					queryKey: ["fsQ-is-registered", wallet?.account.address],
				})
				.then(() =>
					queryClient
						.refetchQueries({
							queryKey: ["fsQ-stored-keygen-data", wallet?.account.address],
						})
						.then(() =>
							queryClient.refetchQueries({
								queryKey: ["fsQ-is-logged-in", wallet?.account.address],
							}),
						),
				);
			return true;
		},
	});
}
