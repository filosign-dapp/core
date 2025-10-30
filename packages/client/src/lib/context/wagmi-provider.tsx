import {
	createConfig,
	WagmiProvider as WagmiProviderBase,
} from "@privy-io/wagmi";
import { hardhat } from "viem/chains";
import { http } from "wagmi";

declare module "wagmi" {
	interface Register {
		config: typeof config;
	}
}

export const config = createConfig({
	chains: [hardhat],
	transports: {
		[hardhat.id]: http(),
	},
});

export function WagmiProvider({ children }: { children: React.ReactNode }) {
	return <WagmiProviderBase config={config}>{children}</WagmiProviderBase>;
}
