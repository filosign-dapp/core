import { filecoinCalibration } from "viem/chains";
import { createConfig, http, WagmiProvider } from "wagmi";

export const config = createConfig({
	chains: [filecoinCalibration],
	transports: {
		[filecoinCalibration.id]: http(),
	},
});

export function WagmiProviderA({ children }: { children: React.ReactNode }) {
	return <WagmiProvider config={config}>{children}</WagmiProvider>;
}
