import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import client from "../utils/api-client";

/**
 * Get all waitlist emails
 */
export function useWaitlistEmails() {
	return useQuery({
		queryKey: ["waitlist"],
		queryFn: async () => {
			const result = await client.waitlist.index.$get();
			const parsed = await result.json();

			if (!parsed.success) {
				throw new Error(parsed.error);
			}

			return parsed.data;
		},
	});
}

/**
 * Check if an email exists in the waitlist
 */
export function useCheckEmailExists(email: string) {
	return useQuery({
		queryKey: ["waitlist", "check", email],
		queryFn: async () => {
			const result = await client.waitlist.check[":email"].$get({
				param: { email },
			});
			const parsed = await result.json();

			if (!parsed.success) {
				throw new Error(parsed.error);
			}

			return parsed.data;
		},
		enabled: Boolean(email),
	});
}

/**
 * Join the waitlist
 */
export function useJoinWaitlist() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (email: string) => {
			const result = await client.waitlist.index.$post({
				json: { email },
			});

			const parsed = await result.json();

			if (!parsed.success) {
				throw new Error(parsed.error);
			}

			return parsed.data;
		},
		onSuccess: () => {
			toast.success("Successfully joined the waitlist!");
			queryClient.invalidateQueries({ queryKey: ["waitlist"] });
		},
		onError: (err: Error) => {
			console.error(err);
			toast.error(err.message || "Failed to join waitlist");
		},
	});
}

/**
 * Remove email from waitlist
 */
export function useRemoveFromWaitlist() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (email: string) => {
			const result = await client.waitlist[":email"].$delete({
				param: { email },
			});

			const parsed = await result.json();

			if (!parsed.success) {
				throw new Error(parsed.error);
			}

			return parsed.data;
		},
		onSuccess: () => {
			toast.success("Successfully removed from waitlist!");
			queryClient.invalidateQueries({ queryKey: ["waitlist"] });
		},
		onError: (err: Error) => {
			console.error(err);
			toast.error(err.message || "Failed to remove from waitlist");
		},
	});
}
