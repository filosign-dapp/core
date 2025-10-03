import { http } from "wagmi";
import { mainnet, filecoinCalibration } from "viem/chains";
import {
  createConfig,
  WagmiProvider as WagmiProviderBase,
} from "@privy-io/wagmi";

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

export const config = createConfig({
  chains: [mainnet, filecoinCalibration],
  transports: {
    [mainnet.id]: http(),
    [filecoinCalibration.id]: http(),
  },
});

export function WagmiProvider({ children }: { children: React.ReactNode }) {
  return <WagmiProviderBase config={config}>{children}</WagmiProviderBase>;
}