import { type FilosignContracts, getContracts } from "@filosign/contracts";
import { useQuery } from "@tanstack/react-query";
import {
	createContext,
	createElement,
	type ReactNode,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import type { Chain } from "viem";
import { useWalletClient } from "wagmi";
import ApiClient from "../ApiClient";
import { DAY } from "../constants";

type FilosignContext = {
	ready: boolean;
	api: ApiClient;
	contracts: FilosignContracts | null;
};

const FilosignContext = createContext<FilosignContext>({
	ready: false,
	api: {} as ApiClient,
	contracts: null,
});

type FilosignConfig = {
	children: ReactNode;
	apiBaseUrl: string;
};

export function FilosignProvider(props: FilosignConfig) {
	const { children, apiBaseUrl } = props;

	const [contracts, setContracts] = useState<FilosignContracts | null>(null);

	const { data: wallet } = useWalletClient();

	const { data: api } = useQuery({
		queryKey: [
			"api-client",
			apiBaseUrl,
			apiBaseUrl.includes("localhost") ? Date.now() : null,
		],
		queryFn: async () => {
			return new ApiClient(apiBaseUrl);
		},
		staleTime: 1 * DAY,
	});
	const runtime = useQuery({
		queryKey: [
			"runtime",
			apiBaseUrl,
			apiBaseUrl.includes("localhost") ? Date.now() : null,
		],
		queryFn: async () => {
			const runtime = await fetch(`${apiBaseUrl}/runtime`).then((res) =>
				res.json(),
			);
			return runtime as { uptime: number; chain: Chain };
		},
		staleTime: 1 * DAY,

		enabled: !!api,
	});

	const flag = useRef(false);

	useEffect(() => {
		if (!flag.current && wallet && runtime.data) {
			const fsContracts = getContracts({
				client: wallet,
				chainId: runtime.data.chain.id,
			});
			setContracts(fsContracts);
		}
	}, [runtime.data, wallet]);

	const value: FilosignContext = {
		ready: !!api,
		api: api as ApiClient,
		contracts,
	};

	return createElement(FilosignContext.Provider, { value }, children);
}

export function useFilosignContext() {
	return useContext(FilosignContext);
}
