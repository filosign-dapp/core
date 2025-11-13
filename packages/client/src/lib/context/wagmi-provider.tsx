import {
	createConfig,
	WagmiProvider as WagmiProviderBase,
} from "@privy-io/wagmi";
import { http } from "wagmi";
import { useStorePersist } from "../hooks/use-store";

declare module "wagmi" {
	interface Register {
		config: ReturnType<typeof createConfig>;
	}
}

export function WagmiProvider({ children }: { children: React.ReactNode }) {
	const { runtimeChain } = useStorePersist();

	const config = createConfig({
		chains: [runtimeChain],
		transports: {
			[runtimeChain.id]: http(),
		},
	});

	return <WagmiProviderBase config={config}>{children}</WagmiProviderBase>;
}
