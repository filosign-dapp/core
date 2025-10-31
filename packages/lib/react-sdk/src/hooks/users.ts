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
			if (!contracts || !wallet) return false;

			const userInfo = await api.rpc.getSafe(
				{
					walletAddress: zHexString,
					encryptionPublicKey: zHexString,
					lastActiveAt: z.number(),
					createdAt: z.number(),
				},
				`/user/profile/${address}`,
			);

			return userInfo.data;
		},
		enabled: !!wallet && !!contracts,
		staleTime: 1 * DAY,
	});
}
