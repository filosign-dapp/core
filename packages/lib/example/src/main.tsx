import { FilosignProvider } from "@filosign/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { createConfig, WagmiProvider } from "wagmi";
import { hardhat } from "wagmi/chains";
import { mock } from "wagmi/connectors";
import App from "./App.tsx";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<QueryClientProvider client={queryClient}>
			<WagmiProvider
				config={createConfig({
					chains: [hardhat],
					connectors: [
						mock({
							features: {
								defaultConnected: true,
								reconnect: true,
							},
							accounts: ["0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65"],
						}),
					],
					client: ({ chain }) =>
						createWalletClient({ chain, transport: http() }),
				})}
			>
				<FilosignProvider apiBaseUrl="http://localhost:30011/v1">
					<div
						style={{
							background: "black",
							color: "white",
							display: "flex",
							flexDirection: "column",
							minHeight: "100vh",
						}}
					>
						<App />
					</div>
				</FilosignProvider>
			</WagmiProvider>
		</QueryClientProvider>
	</StrictMode>,
);
