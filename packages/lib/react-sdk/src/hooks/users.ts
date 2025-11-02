import { useMutation, useQuery } from "@tanstack/react-query";
import imageCompression from "browser-image-compression";
import type { Address } from "viem";
import z from "zod";
import { zHexString } from "../../utils/zod";
import { DAY, MINUTE } from "../constants";
import { useAuthedApi } from "./auth";

export function useUserProfileByQuery(query: {
    address?: Address | undefined;
    username?: string | undefined;
}) {
    const { data: api } = useAuthedApi();

    return useQuery({
        queryKey: ["fsQ-user-info-by-address", query],
        queryFn: async () => {
            if ((!query.address && !query.username) || !api)
                throw new Error("Not unreachable");

            if (!!query.address && !!query.username) {
                console.warn(
                    "Both address and username provided to useUserProfileByQuery, using address",
                );
            }

            const userInfo = await api.rpc.getSafe(
                {
                    walletAddress: zHexString(),
                    encryptionPublicKey: zHexString(),

                    lastActiveAt: z.string(),
                    createdAt: z.string(),
                    avatarUrl: z.string().nullable(),
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
                    avatarUrl: z.string().nullable(),
                },
                `/users/profile`,
            );
            return user.data;
        },
        staleTime: 1 * DAY,
        enabled: !!api,
    });
}

export function useUpdateUserProfilePrevalidate(args: {
    email?: string;
    username?: string;
}) {
    const { data: api } = useAuthedApi();

    return useQuery({
        queryKey: ["fsQ-user-profile-prevalidate", args],
        queryFn: async () => {
            if (!api) throw new Error("Not reachable");

            const { email, username } = args;

            const prevalidateResponse = await api.rpc.getSafe(
                {
                    valid: z.boolean(),
                    message: z.string(),
                },
                `/users/profile/prevalidate?${new URLSearchParams({
                    ...(email ? { email } : {}),
                    ...(username ? { username } : {}),
                })}`,
            );

            return prevalidateResponse.data;
        },
        enabled: !!api,
        staleTime: 5 * MINUTE,
    });
}

export function useUpdateUserProfile() {
    const { data: api } = useAuthedApi();

    return useMutation({
        mutationFn: async (args: { email?: string; username?: string }) => {
            if (!api) throw new Error("Not reachable");

            await api.rpc.putSafe({}, `/users/profile`, {
                email: args.email,
                username: args.username,
            });
        },
    });
}

export function useUpdateUserAvatar() {
    const { data: api } = useAuthedApi();

    return useMutation({
        mutationFn: async (args: { avatar: File }) => {
            if (!api) throw new Error("Not reachable");

            if (!args.avatar.type.startsWith("image/")) {
                throw new Error("File must be an image");
            }
            const compressedFile = await imageCompression(args.avatar, {
                maxSizeMB: 32 / 1024, // 32KB
                fileType: "image/webp",
                useWebWorker: true,
            });

            const formData = new FormData();
            formData.append("avatar", compressedFile);

            const response = await api.rpc.putSafe(
                {
                    avatarKey: z.string(),
                },
                `/users/profile/avatar`,
                formData,
            );

            return response.data;
        },
    });
}
