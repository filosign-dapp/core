import { PrivyProvider as PrivyProviderBase } from "@privy-io/react-auth";
import { useStorePersist } from "../hooks/use-store";

export function PrivyProvider({ children }: { children: React.ReactNode }) {
	const { runtimeChain } = useStorePersist();

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
