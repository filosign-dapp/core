import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { ThemeProvider } from "./lib/context/theme-provider";
import { ErrorBoundary } from "./lib/components/errors/ErrorBoundary";
import { QueryClientProvider } from "./lib/context/query-client";
import router from "./pages/app";
import { Toaster } from "sonner";
import { RouterProvider } from "@tanstack/react-router";
import "./globals.css";
import { IconContext } from "@phosphor-icons/react";
// import { PrivyProvider } from "./lib/context/privy-provider";
// import { WagmiProvider } from "./lib/context/wagmi-provider";
import { FilosignProvider } from "./lib/context/filosign-provider";

import { WagmiProvider } from "wagmi";
import { config } from "./lib/context/temp-provider";

// Root element
const rootElement = document.getElementById("root")!;
if (!rootElement) throw new Error("Failed to find the root element");

// App
const app = (
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="theme">
        {/* <PrivyProvider> */}
        <WagmiProvider config={config}>
          <QueryClientProvider>
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
          </QueryClientProvider>
        </WagmiProvider>
        {/* </PrivyProvider> */}
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);

// Hot module replacement
if (import.meta.hot) {
  const root = (import.meta.hot.data.root ??= createRoot(rootElement));
  root.render(app);
} else {
  createRoot(rootElement).render(app);
}
