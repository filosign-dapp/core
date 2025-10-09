import {
	createConfig,
	WagmiProvider as WagmiProviderBase,
} from "@privy-io/wagmi";
import { filecoinCalibration } from "viem/chains";
import { http } from "wagmi";

declare module "wagmi" {
	interface Register {
		config: typeof config;
	}
}

export const config = createConfig({
	chains: [filecoinCalibration],
	transports: {
		[filecoinCalibration.id]: http(),
	},
});

export function WagmiProvider({ children }: { children: React.ReactNode }) {
	return <WagmiProviderBase config={config}>{children}</WagmiProviderBase>;
}
