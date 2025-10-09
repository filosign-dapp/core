import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "sonner";
import { ErrorBoundary } from "./lib/components/errors/ErrorBoundary";
import { QueryClientProvider } from "./lib/context/query-client";
import { ThemeProvider } from "./lib/context/theme-provider";
import router from "./pages/app";
import "./globals.css";
import { IconContext } from "@phosphor-icons/react";
import { Buffer as BufferI } from "buffer";
import { FilosignProvider } from "./lib/context/filosign-provider";
import { PrivyProvider } from "./lib/context/privy-provider";
import { WagmiProvider } from "./lib/context/wagmi-provider";

// Root element
const rootElement = document.getElementById("root")!;
if (!rootElement) throw new Error("Failed to find the root element");

// App
const app = (
	<StrictMode>
		<ErrorBoundary>
			<ThemeProvider defaultTheme="dark" storageKey="theme">
				<QueryClientProvider>
					<PrivyProvider>
						<WagmiProvider>
							<FilosignProvider>
								<IconContext.Provider
									value={{
										mirrored: false,
										weight: "regular",
									}}
								>
									<RouterProvider router={router} />
									<Toaster position="bottom-right" />
								</IconContext.Provider>
							</FilosignProvider>
						</WagmiProvider>
					</PrivyProvider>
				</QueryClientProvider>
			</ThemeProvider>
		</ErrorBoundary>
	</StrictMode>
);

window.Buffer = window.Buffer || BufferI;

// Hot module replacement
if (import.meta.hot) {
	const root = (import.meta.hot.data.root ??= createRoot(rootElement));
	root.render(app);
} else {
	createRoot(rootElement).render(app);
}
