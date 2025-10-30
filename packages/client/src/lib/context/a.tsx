import { WagmiProvider, createConfig, http } from 'wagmi'
import { filecoinCalibration } from 'viem/chains'

export const config = createConfig({
	chains: [filecoinCalibration],
	transports: {
		[filecoinCalibration.id]: http(),
	},
})

export function WagmiProviderA({ children }: { children: React.ReactNode }) {
	return <WagmiProvider config={config}>{children}</WagmiProvider>
}
