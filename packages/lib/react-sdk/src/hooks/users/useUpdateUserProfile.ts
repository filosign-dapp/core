import { useMutation } from "@tanstack/react-query";
import { useAuthedApi } from "../auth";

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
