import { type FilosignContracts, getContracts } from "@filosign/contracts";
import { useQuery } from "@tanstack/react-query";
import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { Chain } from "viem";
import type { UseWalletClientReturnType } from "wagmi";
import ApiClient from "../ApiClient";
import { MINUTE } from "../constants";

/* ---------------------------------- Types --------------------------------- */

type Wallet = UseWalletClientReturnType["data"];

type DilithiumRuntime = {
	generateKeys?: () => unknown;
};

type Runtime = {
	uptime: number;
	chain: Chain;
	serverAddressSynapse: string;
};

type FilosignContextValue = {
	ready: boolean;
	api: ApiClient;
	wallet: Wallet;
	contracts: FilosignContracts | null;
	runtime: Runtime;
	wasm: {
		dilithium: DilithiumRuntime | null;
	};
};

type FilosignConfig = {
	children: ReactNode;
	apiBaseUrl: string;
	wallet: Wallet | undefined;
	wasm: {
		dilithium: DilithiumRuntime | null;
	};
};

/* ------------------------------- Context ---------------------------------- */

const FilosignContext = createContext<FilosignContextValue>({
	ready: false,
	api: {} as ApiClient,
	wallet: undefined,
	contracts: null,
	runtime: {} as Runtime,
	wasm: {
		dilithium: null,
	},
});

/* ------------------------------- Provider --------------------------------- */

export function FilosignProvider(props: FilosignConfig) {
	const { children, apiBaseUrl, wallet, wasm } = props;

	const [contracts, setContracts] = useState<FilosignContracts | null>(null);

	const api = useMemo(() => new ApiClient(apiBaseUrl), [apiBaseUrl]);

	const runtime = useQuery({
		queryKey: ["runtime", apiBaseUrl],
		queryFn: async () => {
			const response = await api.rpc.base.get("/runtime");
			const data = await response.data;
			if (!data) throw new Error("Failed to fetch runtime");
			return data as Runtime;
		},
		staleTime: 5 * MINUTE,
		enabled: Boolean(api),
	});

	const initialized = useRef(false);

	useEffect(() => {
		if (!initialized.current && wallet && runtime.data) {
			initialized.current = true;

			const fsContracts = getContracts({
				client: wallet,
				chainId: runtime.data.chain.id,
			});

			setContracts(fsContracts);
		}
	}, [runtime.data, wallet]);

	const value: FilosignContextValue = useMemo(
		() => ({
			ready: Boolean(api && runtime.data),
			api,
			wallet,
			contracts,
			runtime: runtime.data ?? ({} as Runtime),
			wasm: {
				dilithium: wasm.dilithium,
			},
		}),
		[api, wallet, contracts, runtime.data, wasm.dilithium],
	);

	return (
		<FilosignContext.Provider value={value}>
			{children}
		</FilosignContext.Provider>
	);
}

/* ---------------------------------- Hook ---------------------------------- */

export function useFilosignContext() {
	return useContext(FilosignContext);
}
