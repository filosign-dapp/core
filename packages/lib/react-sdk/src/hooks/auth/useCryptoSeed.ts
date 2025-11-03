import { idb } from "../../../utils/idb";
import { useFilosignContext } from "../../context/FilosignProvider";

export function useCryptoSeed() {
	const { wallet, wasm } = useFilosignContext();

	async function action<T>(fn: (seed: Uint8Array<ArrayBuffer>) => T) {
		while (!wasm.dilithium) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
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
