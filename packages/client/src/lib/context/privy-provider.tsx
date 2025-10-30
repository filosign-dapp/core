import { PrivyProvider as PrivyProviderBase } from "@privy-io/react-auth";
import { filecoinCalibration } from "viem/chains";

export function PrivyProvider({ children }: { children: React.ReactNode }) {
	return (
		<PrivyProviderBase
			appId={process.env.BUN_PUBLIC_PRIVY_APP_ID!}
			config={{
				defaultChain: filecoinCalibration,
				supportedChains: [filecoinCalibration],
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
