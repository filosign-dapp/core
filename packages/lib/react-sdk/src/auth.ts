import { useMutation, useQuery } from "@tanstack/react-query";
import { useWalletClient } from "wagmi";

export function useIsRegistered() {
	const wallet = useWalletClient();

	return useQuery({
		queryKey: ["fsQ-is-registered", wallet?.data?.account?.address],
		queryFn: async () => {},
	});
}

export function useLogin() {
	const wallet = useWalletClient();

	return useMutation({
		mutationKey: ["fsM-login"],
		mutationFn: async (params: { address: string; signature: string }) => {},
	});
}

export function useLogout() {}
