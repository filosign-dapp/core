import { useQuery } from "@tanstack/react-query";
import z from "zod";
import { MINUTE } from "../../constants";
import { useFilosignContext } from "../../context/FilosignProvider";

export function useSentFiles() {
	const { api } = useFilosignContext();

	return useQuery({
		queryKey: ["sent-files"],
		queryFn: async () => {
			const response = await api.rpc.getSafe(
				{
					sentFiles: z.array(
						z.object({
							pieceCid: z.string(),
							sender: z.string(),
							status: z.string(),
						}),
					),
				},
				"/files/sent",
			);

			return response.data.sentFiles;
		},
		staleTime: 5 * MINUTE,
	});
}
