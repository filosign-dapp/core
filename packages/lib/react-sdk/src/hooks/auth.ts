import { seedKeyGen, toHex, walletKeyGen } from "@filosign/crypto-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { idb } from "../../utils/idb";
import { DAY, MINUTE } from "../constants";
import { useFilosignContext } from "../context/FilosignProvider";

export function useIsRegistered() {
	const { contracts, wallet } = useFilosignContext();

	return useQuery({
		queryKey: ["fsQ-is-registered", wallet?.account.address],
		queryFn: async () => {
			if (!contracts || !wallet) {
				throw new Error("unreachable");
			}

			try {
				const isRegistered = await contracts.FSKeyRegistry.read.isRegistered([
					wallet.account.address,
				]);
				return isRegistered;
			} catch (error) {
				console.error("Failed to check if user is registered", error);
				throw error;
			}
		},
		staleTime: 5 * MINUTE,
		enabled: !!contracts,
	});
}

export function useStoredKeygenData() {
	const { wallet, contracts } = useFilosignContext();

	return useQuery({
		queryKey: ["fsQ-stored-keygen-data", wallet?.account.address],
		queryFn: async () => {
			if (!wallet || !contracts) {
				throw new Error("unreachable");
			}

			const [saltPin, saltSeed, saltChallenge, commitmentKem, commitmentSig] =
				await contracts.FSKeyRegistry.read.keygenData([wallet.account.address]);

			if (
				!saltPin ||
				!saltSeed ||
				!saltChallenge ||
				!commitmentKem ||
				!commitmentSig
			)
				return undefined;

			return {
				saltPin,
				saltSeed,
				saltChallenge,
				commitmentKem,
				commitmentSig,
			};
		},
		staleTime: 1 * DAY,
		enabled: !!wallet && !!contracts,
	});
}

export function useIsLoggedIn() {
	const { wallet, contracts, wasm } = useFilosignContext();
	const { data: isRegistered } = useIsRegistered();
	const { data: storedKeygenData } = useStoredKeygenData();

	return useQuery({
		queryKey: ["fsQ-is-logged-in", wallet?.account.address],
		queryFn: async () => {
			if (!wallet || !contracts || !wasm.dilithium) return false;
			if (!isRegistered || !storedKeygenData) return false;

			const keyStore = idb({
				db: wallet.account.address,
				store: "fs-keystore",
			});

			const keySeed = await keyStore.secret.get("key-seed");
			if (!keySeed) return false;

			const keygenData = await seedKeyGen(keySeed, { dl: wasm.dilithium });

			const { commitmentKem, commitmentSig } = storedKeygenData;

			if (
				commitmentKem !== keygenData.commitmentKem ||
				commitmentSig !== keygenData.commitmentSig
			) {
				keyStore.del("key-seed");
				return false;
			}
		},
		enabled: !!wallet && !!contracts && !!wasm.dilithium,
	});
}

export function useLogin() {
	const { api, contracts, wallet, wasm } = useFilosignContext();
	const queryClient = useQueryClient();

	const { data: isRegistered } = useIsRegistered();
	const { data: isLoggedIn } = useIsLoggedIn();

	return useMutation({
		mutationKey: ["fsM-login"],
		mutationFn: async (params: { pin: string }) => {
			if (isLoggedIn) return;

			const { pin } = params;

			if (!contracts || !wallet || !wasm.dilithium) {
				throw new Error("unreachable");
			}

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
			}

			queryClient.refetchQueries({
				queryKey: ["fsQ-is-logged-in", wallet?.account.address],
			});
		},
	});
}

export function useLogout() {
	const { wallet } = useFilosignContext();
	const queryClient = useQueryClient();

	if (!wallet) throw new Error("login to logout");

	const keyStore = idb({
		db: wallet.account.address,
		store: "fs-keystore",
	});
	return useMutation({
		mutationKey: ["fsM-logout"],
		mutationFn: async () => {
			keyStore.del("key-seed");
			queryClient.invalidateQueries({
				queryKey: ["fsQ-is-logged-in", wallet?.account.address],
			});
		},
	});
}
