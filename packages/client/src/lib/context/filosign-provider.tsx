import { FilosignProvider as FilosignProviderBase } from "@filosign/react";
import { usePrivy } from "@privy-io/react-auth";
import { useWalletClient } from "wagmi";

export function FilosignProvider({ children }: { children: React.ReactNode }) {
	const { ready } = usePrivy();

	if (!ready) {
		return <>{children}</>;
	}

	return (
		<FilosignProviderBase
			apiBaseUrl={process.env.BUN_PUBLIC_PLATFORM_URL!}
		>
			{children}
		</FilosignProviderBase>
	);
}
