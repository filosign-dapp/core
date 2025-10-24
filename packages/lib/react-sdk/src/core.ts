import { getContracts } from "@filosign/contracts";
import { useMemo } from "react";
import { useWalletClient } from "wagmi";

export function useContracts() {
	const { data: client } = useWalletClient();

	const address = client?.account.address;

	if (!address) {
		throw new Error("Wallet client not available");
	}

	return useMemo(() => {
		return getContracts(client);
	}, [client]);
}

export function useServerInfo() {}
