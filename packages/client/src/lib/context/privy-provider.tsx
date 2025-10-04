import { PrivyProvider as PrivyProviderBase } from "@privy-io/react-auth";
import { useTheme } from "./theme-provider";
import { filecoinCalibration } from "viem/chains";

export function PrivyProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <PrivyProviderBase
      appId={process.env.BUN_PUBLIC_PRIVY_APP_ID!}
      config={{
        defaultChain: filecoinCalibration,
        supportedChains: [filecoinCalibration],
        loginMethods: ["wallet", "google", "twitter", "github"],
        appearance: {
          theme: "light",
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      {children}
    </PrivyProviderBase>
  );
}
