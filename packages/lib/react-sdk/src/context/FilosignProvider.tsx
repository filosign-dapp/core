import { type FilosignContracts, getContracts } from "@filosign/contracts";
import { useQuery } from "@tanstack/react-query";
import {
	createContext,
	createElement,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { Chain } from "viem";
import { type UseWalletClientReturnType, useWalletClient } from "wagmi";
import ApiClient from "../ApiClient";
import { DAY, MINUTE } from "../constants";

type FilosignContext = {
	ready: boolean;
	api: ApiClient;
	wallet: UseWalletClientReturnType["data"];
	contracts: FilosignContracts | null;
};

const FilosignContext = createContext<FilosignContext>({
	ready: false,
	api: {} as ApiClient,
	wallet: undefined,
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
	const api = useMemo(() => new ApiClient(apiBaseUrl), [apiBaseUrl]);

	const runtime = useQuery({
		queryKey: [
			"runtime",
			apiBaseUrl,
			// apiBaseUrl.includes("localhost") ? Date.now() : null,
		],
		queryFn: async () => {
			const runtime = await fetch(`${apiBaseUrl}/runtime`).then((res) =>
				res.json(),
			);
			return runtime as { uptime: number; chain: Chain };
		},
		staleTime: 5 * MINUTE,

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

	console.log(api, wallet);

	const value: FilosignContext = useMemo(
		() => ({
			ready: !!api,
			wallet: wallet,
			api: api as ApiClient,
			contracts,
		}),
		[api, wallet, contracts],
	);

	return createElement(FilosignContext.Provider, { value }, children);
}

export function useFilosignContext() {
	return useContext(FilosignContext);
}
