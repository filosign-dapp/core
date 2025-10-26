import type { FilosignContracts, getContracts } from "@filosign/contracts";
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
import type ApiClient from "../ApiClient";

type FilosignContext = {
	ready: boolean;
	api: ApiClient;
	contracts: FilosignContracts;
};

const FilosignContext = createContext<FilosignContext>({
	ready: false,
	api: {} as ApiClient,
	contracts: {} as FilosignContracts,
});

type FilosignConfig = {
	children: ReactNode;
	apiBaseUrl: string;
};

export function FilosignProvider(props: FilosignConfig) {
	const { children, apiBaseUrl } = props;
	const [ready, setReady] = useState<boolean>(false);
	const [api, setApi] = useState<ApiClient>({} as ApiClient);
	const [contracts, setContracts] = useState<FilosignContracts>(
		{} as FilosignContracts,
	);

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
	});

	const flag = useRef(false);

	useEffect(() => {
		if (runtime.data && !flag.current) {
			const { uptime, chain } = runtime.data;

			const fsContracts = getContracts({ client: api, chainId: chain.id });
		}
	}, [runtime.data]);

	const value: FilosignContext = {
		ready,
	};

	useEffect(() => {}, []);

	return createElement(FilosignContext.Provider, { value }, children);
}

export function useFilosignContext() {
	return useContext(FilosignContext);
}
