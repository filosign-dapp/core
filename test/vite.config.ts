import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			"dilithium-crystals-js": "/dilithium-stub.js",
		},
	},
	server: {
		port: 3000,
		fs: {
			strict: false,
		},
	},
	optimizeDeps: {
		exclude: [
			"dilithium-crystals-js",
			"@filosign/crypto-utils",
			"@filosign/react",
			"@filosign/contracts",
		],
	},
	build: {
		commonjsOptions: {
			exclude: ["dilithium-crystals-js"],
		},
	},
});
