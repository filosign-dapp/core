import { FilosignProvider as FilosignProviderBase } from "@filosign/sdk/react";
import { useWalletClient } from "wagmi";

export function FilosignProvider({ children }: { children: React.ReactNode }) {
	const { data: walletClient } = useWalletClient();

	return (
		<FilosignProviderBase
			config={{
				apiBaseUrl: process.env.BUN_PUBLIC_PLATFORM_URL!,
				wallet: walletClient,
			}}
		>
			{children}
		</FilosignProviderBase>
	);
}
