import { FilosignProvider as FilosignProviderBase } from "@filosign/sdk/react";
import { useWalletClient } from "wagmi";

export function FilosignProvider({ children }: { children: React.ReactNode }) {
  const { data: walletClient } = useWalletClient();

  console.log("walletClient", walletClient);

  return (
    <FilosignProviderBase
      config={{
        apiBaseUrl: process.env.BUN_PUBLIC_PLATFORM_URL!,
        wallet: walletClient,
      }}
    >
      <div className="bg-blue-400/30 inset-0 absolute z-20 pointer-events-none" />
      {children}
    </FilosignProviderBase>
  );
}
