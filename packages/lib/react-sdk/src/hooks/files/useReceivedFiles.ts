import { useQuery } from "@tanstack/react-query";
import z from "zod";
import { useFilosignContext } from "../../context/FilosignProvider";

export function useReceivedFiles() {
    const { api } = useFilosignContext();

    return useQuery({
        queryKey: ["received-files"],
        queryFn: async () => {
            const response = await api.rpc.getSafe(
                {
                    receivedFiles: z.array(z.object({
                        pieceCid: z.string(),
                        sender: z.string(),
                        status: z.string(),
                    })),
                },
                "/files/received"
            );

            return response.data.receivedFiles;
        },
    });
}
