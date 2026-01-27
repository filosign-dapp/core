import { FilosignProvider as FilosignProviderBase } from "@filosign/react";
import { useEffect, useState } from "react";
import { useWalletClient } from "wagmi";
import { Loader } from "../components/ui/loader";

type DilithiumModule =
	| (() => Promise<unknown>)
	| {
			createDilithium?: () => Promise<unknown>;
	  }
	| unknown;

export function FilosignProvider({ children }: { children: React.ReactNode }) {
	const { data: wallet } = useWalletClient();

	const [dilithium, setDilithium] = useState<unknown>(null);

	useEffect(() => {
		let mounted = true;

		async function init() {
			try {
				// mock chrome for wasm lib
				(globalThis as { chrome?: unknown }).chrome = {
					runtime: {
						getURL: () => "/static/dilithium.wasm",
					},
				};

				const module: DilithiumModule = await import(
					"dilithium-crystals-js/dist/dilithium.min.js"
				);

				let dil: unknown = null;

				if (typeof module === "function") {
					dil = await module();
				} else if (
					typeof module === "object" &&
					module !== null &&
					"createDilithium" in module &&
					typeof (module as { createDilithium?: unknown }).createDilithium ===
						"function"
				) {
					dil = await (
						module as {
							createDilithium: () => Promise<unknown>;
						}
					).createDilithium();
				} else {
					dil = module;
				}

				if (!mounted) return;
				setDilithium(dil);
			} catch (err) {
				console.error("Failed to init Dilithium:", err);
			}
		}

		init();
		return () => {
			mounted = false;
		};
	}, []);

	return (
		<FilosignProviderBase
			apiBaseUrl={process.env.BUN_PUBLIC_PLATFORM_URL || "localhost:30011"}
			wasm={{ dilithium }}
			wallet={wallet}
			loader={Loader}
		>
			{Boolean(
				typeof dilithium === "object" &&
					dilithium !== null &&
					"generateKeys" in dilithium,
			) && children}
		</FilosignProviderBase>
	);
}
