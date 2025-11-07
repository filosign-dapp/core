import { useQuery } from "@tanstack/react-query";
import { useAcceptedRecipients } from "./useSendableTo";

export function useAcceptedPeople() {
	const { data: acceptedRecipients } = useAcceptedRecipients();

	return useQuery({
		queryKey: ["accepted-people", acceptedRecipients],
		queryFn: async () => {
			if (!acceptedRecipients) return { people: [] };

			// Fetch profiles for each accepted recipient
			const people = await Promise.all(
				acceptedRecipients.map(async (request) => {
					try {
						const response = await fetch(`/api/users/profile/${request.recipientWallet}`);
						if (!response.ok) throw new Error('Failed to fetch profile');

						const profile = await response.json();
						return {
							walletAddress: profile.walletAddress,
							displayName: profile.displayName || null,
							username: profile.username || null,
						};
					} catch (error) {
						console.error(`Failed to fetch profile for ${request.recipientWallet}:`, error);
						// Return basic info if profile fetch fails
						return {
							walletAddress: request.recipientWallet,
							displayName: null,
							username: null,
						};
					}
				})
			);

			return { people };
		},
		enabled: !!acceptedRecipients,
	});
}
