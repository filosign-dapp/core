import { useQuery } from "@tanstack/react-query";
import type { Address } from "viem";
import z from "zod";
import { zHexString } from "../../utils/zod";
import { DAY } from "../constants";
import { useAuthedApi } from "./auth";

export function useUserProfileByQuery(query: { address?: Address | undefined, username?: string | undefined }) {
    const { data: api } = useAuthedApi()

    return useQuery({
        queryKey: ["fsQ-user-info-by-address", query],
        queryFn: async () => {
            if (!query.address && !query.username || !api) throw new Error("Not unreachable");

            if (!!query.address && !!query.username) {
                console.warn("Both address and username provided to useUserProfileByQuery, using address");
            }

            const userInfo = await api.rpc.getSafe(
                {
                    walletAddress: zHexString(),
                    encryptionPublicKey: zHexString(),

                    lastActiveAt: z.string(),
                    createdAt: z.string(),
                },
                `/users/profile/${query.address ?? query.username}`,
            );

            return userInfo.data;
        },
        enabled: (!!query.address || !!query.username) && !!api,
        staleTime: 1 * DAY,
    });

}

export function useUserProfile() {
    const { data: api } = useAuthedApi();

    return useQuery({
        queryKey: ["user"],
        queryFn: async () => {
            if (!api) throw new Error("Noreachable");
            const user = await api.rpc.getSafe(
                {
                    walletAddress: zHexString(),
                    keygenData: z.any().nullable(),
                    createdAt: z.string(),
                    email: z.string().nullable(),
                    username: z.string().nullable(),
                },
                `/users/profile`,
            );
            return user.data;
        },
        staleTime: 1 * DAY,
        enabled: !!api,
    });
}

export function useUpdateUserProfile() {
    const { data: api } = useAuthedApi();


}
