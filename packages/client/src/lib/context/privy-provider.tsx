import { PrivyProvider as PrivyProviderBase } from "@privy-io/react-auth";
import { filecoinCalibration, hardhat } from "viem/chains";

export function PrivyProvider({ children }: { children: React.ReactNode }) {
	const runtimeChain =
		process.env.BUN_PUBLIC_RUNTIME_CHAIN_ID === "314159"
			? filecoinCalibration
			: hardhat;

	if (
		!process.env.BUN_PUBLIC_PRIVY_APP_ID ||
		!process.env.BUN_PUBLIC_PRIVY_APP_SECRET
	) {
		throw new Error(
			"BUN_PUBLIC_PRIVY_APP_ID or BUN_PUBLIC_PRIVY_APP_SECRET are not set",
		);
	}

	return (
		<PrivyProviderBase
			appId={process.env.BUN_PUBLIC_PRIVY_APP_ID}
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
