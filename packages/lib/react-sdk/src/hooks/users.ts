import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import z from "zod";
import { zHexString } from "../../utils/zod";
import { DAY } from "../constants";
import { useAuthedApi } from "./auth";

export function useUserProfileByAddress(address: Address | undefined) {
    const { data: api } = useAuthedApi()

    return useQuery({
        queryKey: ["fsQ-user-info-by-address", address],
        queryFn: async () => {
            if (!address || !api) throw new Error("Not unreachable");

            const userInfo = await api.rpc.getSafe(
                {
                    walletAddress: zHexString(),
                    encryptionPublicKey: zHexString(),
                    lastActiveAt: z.string(),
                    createdAt: z.string(),
                },
                `/users/profile/${address}`,
            );

            return userInfo.data;
        },
        enabled: !!address && !!api,
        staleTime: 1 * DAY,
    });
}
