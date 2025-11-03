import { seedKeyGen } from "@filosign/crypto-utils";
import { useQuery } from "@tanstack/react-query";
import { idb } from "../../../utils/idb";
import { DAY } from "../../constants";
import { useFilosignContext } from "../../context/FilosignProvider";
import { useIsRegistered } from "./useIsRegistered";
import { useStoredKeygenData } from "./useStoredKeygenData";

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
