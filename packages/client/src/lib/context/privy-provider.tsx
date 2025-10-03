import { PrivyProvider as PrivyProviderBase } from '@privy-io/react-auth';
import { useTheme } from './theme-provider';
import { mainnet, hardhat } from 'viem/chains';

const isProd = process.env.NODE_ENV === "production";

export function PrivyProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useTheme();

    return (
        <PrivyProviderBase
            appId={process.env.BUN_PUBLIC_PRIVY_APP_ID!}
            config={{
                defaultChain: isProd ? mainnet : hardhat,
                supportedChains: isProd ? [mainnet] : [hardhat, mainnet],
                loginMethods: ["wallet", "google", "twitter", "github"],
                appearance: {
                    theme: "light",
                },
                embeddedWallets: {
                  ethereum: {
                    createOnLogin: 'users-without-wallets',
                  }
                }
            }}
        >
            {children}
        </PrivyProviderBase>
    )
}