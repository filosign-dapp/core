import { seedKeyGen, signatures, toBytes, toHex, walletKeyGen } from "@filosign/crypto-utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import z from "zod";
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

            return true;
        },
        staleTime: 1 * DAY,
        enabled:
            !!wallet &&
            !!contracts &&
            !!wasm.dilithium &&
            !!isRegistered &&
            !!storedKeygenData,
    });
}

export function useAuthedApi() {
    const { api, wallet, wasm } = useFilosignContext();
    const { action: cryptoAction } = useCryptoSeed();

    return useQuery({
        queryKey: ["fsQ-authed-api", api.rpc, wallet?.account.address],
        queryFn: async () => {
            if (!api || !wallet) {
                throw new Error("unreachable");
            }

            if (api.jwtExists) {
                api.ensureJwt();
                return api;
            }

            await cryptoAction(async (seed) => {
                const { data: { nonce } } = await api.rpc.getSafe(
                    {
                        nonce: z.string(),
                    },
                    `/auth/nonce?address=${wallet.account.address}`,
                );

                const dl3Keypair = await signatures.keyGen({
                    dl: wasm.dilithium,
                    seed: seed
                })

                const signature = await signatures.sign({
                    dl: wasm.dilithium,
                    privateKey: (dl3Keypair).privateKey,
                    message: toBytes(nonce)
                })

                const { data: { token } } = await api.rpc.postSafe(
                    {
                        token: z.string()
                    },
                    `/auth/verify`,
                    {
                        address: wallet.account.address,
                        signature: toHex(signature)
                    }
                )

                api.setJwt(token)
            });

            api.ensureJwt();

            return api;
        },
        enabled: !!wallet && !!api,
    });
}

export function useCryptoSeed() {
    const { wallet, wasm } = useFilosignContext();

    async function action<T>(fn: (seed: Uint8Array<ArrayBuffer>) => T) {
        while (!wasm.dilithium) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        if (!wallet) {
            throw new Error("No wallet available");
        }
        const keyStore = idb({
            db: wallet.account.address,
            store: "fs-keystore",
        });

        const keySeed = await keyStore.secret.get("key-seed");
        if (!keySeed)
            throw new Error(
                "No key seed found in keystore, most probably not logged in",
            );

        return fn(new Uint8Array(keySeed));
    }

    return { action };
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

            queryClient.refetchQueries({
                queryKey: ["fsQ-is-logged-in", wallet?.account.address],
            });
        },
    });
}

export function useLogout() {
    const { wallet } = useFilosignContext();
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["fsM-logout"],
        mutationFn: async () => {
            if (!wallet) {
                throw new Error("No wallet available for logout");
            }

            const keyStore = idb({
                db: wallet.account.address,
                store: "fs-keystore",
            });
            keyStore.del("key-seed");
            queryClient.invalidateQueries({
                queryKey: ["fsQ-is-logged-in", wallet?.account.address],
            });
        },
    });
}
