import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import z from "zod";
import { zHexString } from "../../utils/zod";
import { DAY } from "../constants";
import { useFilosignContext } from "../context/FilosignProvider";

export function useUserProfileByAddress(address: Address | undefined) {
	const { contracts, wallet, api } = useFilosignContext();

	return useQuery({
		queryKey: ["fsQ-user-info-by-address", address, wallet?.account.address],
		queryFn: async () => {
			if (!contracts || !wallet) throw new Error("No contracts or wallet found");
			if (!address) throw new Error("No address provided");

			const userInfo = await api.rpc.getSafe(
				{
					walletAddress: zHexString(),
					encryptionPublicKey: zHexString(),
					lastActiveAt: z.number(),
					createdAt: z.number(),
				},
				`/users/profile/${address}`,
			);

			return userInfo.data;
		},
		enabled: !!wallet && !!contracts && !!address,
		staleTime: 1 * DAY,
	});
}
