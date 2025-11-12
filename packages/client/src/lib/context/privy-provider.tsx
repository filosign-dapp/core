import { PrivyProvider as PrivyProviderBase } from "@privy-io/react-auth";
import { useRuntimeChain } from "@filosign/react/hooks";

export function PrivyProvider({ children }: { children: React.ReactNode }) {
	const runtimeChain = useRuntimeChain();
	return (
		<PrivyProviderBase
			appId={process.env.BUN_PUBLIC_PRIVY_APP_ID!}
			config={{
				defaultChain: runtimeChain,
				supportedChains: [runtimeChain],
				loginMethods: ["wallet", "google", "twitter", "github", "discord"],
				appearance: {
					theme: "light",
				},
				embeddedWallets: {
					ethereum: {
						createOnLogin: "users-without-wallets",
					},
					showWalletUIs: false,
				},
			}}
		>
			{children}
		</PrivyProviderBase>
	);
}
