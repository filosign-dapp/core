import { seedKeyGen, walletKeyGen } from "@filosign/crypto-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { idb } from "../../utils/idb";
import { DAY, MINUTE } from "../constants";
import { useFilosignContext } from "../context/FilosignProvider";

export function useHook() {
	const { contracts, wallet, api } = useFilosignContext();
	const queryClient = useQueryClient();

	const isRegistered = useQuery({
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
	const isRegisteredValue = isRegistered.data;

	const storedKeygenData = useQuery({
		queryKey: ["fsQ-stored-keygen-data", wallet?.account.address],
		queryFn: async () => {
			if (!wallet || !contracts || !isRegisteredValue) {
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
	const storedKeygenDataValue = storedKeygenData.data;

	const isLoggedIn = useQuery({
		queryKey: ["fsQ-is-logged-in", wallet?.account.address],
		queryFn: async () => {
			if (!wallet || !contracts) return false;
			if (!isRegisteredValue || !storedKeygenDataValue) return false;

			const keyStore = idb({
				db: wallet.account.address,
				store: "fs-keystore",
			});

			const keySeed = await keyStore.secret.get("key-seed");
			if (!keySeed) return false;

			const keygenData = await seedKeyGen(keySeed);

			const { commitmentKem, commitmentSig } = storedKeygenDataValue;

			if (
				commitmentKem !== keygenData.commitmentKem ||
				commitmentSig !== keygenData.commitmentSig
			) {
				keyStore.del("key-seed");
				return false;
			}
		},
	});
	const isLoggedInValue = isLoggedIn.data;

	const login = useMutation({
		mutationKey: ["fsM-login"],
		mutationFn: async (params: { pin: string }) => {
			if (isLoggedInValue) return;

			const { pin } = params;

			if (!contracts || !wallet) {
				throw new Error("unreachable");
			}

			if (!isRegisteredValue) {
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

			queryClient.refetchQueries({
				queryKey: ["fsQ-is-logged-in", wallet?.account.address],
			});
		},
	});

	const logout = () => {
		if (!wallet) throw new Error("unreachable");

		const keyStore = idb({
			db: wallet.account.address,
			store: "fs-keystore",
		});
		keyStore.del("key-seed");

		window.location.reload();
	};

	return {
		isRegistered,
		storedKeygenData,
		isLoggedIn,
		login,
		logout,
	};
}
