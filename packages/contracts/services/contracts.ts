import {
	type Account,
	type Chain,
	type Client,
	createPublicClient,
	getContract,
	http,
	type PublicClient,
	type Transport,
	type WalletClient,
} from "viem";
import { definitions } from "../definitions";

function getKeyedClient<T extends Client | WalletClient>(client: T) {
	return {
		public: createPublicClient({
			transport: http(client.chain?.rpcUrls.default.http[0]),
		}),
		wallet: client,
	} as {
		public: PublicClient<Transport, Chain>;
		wallet: WalletClient<Transport, Chain, Account>;
	};
}

export function getContracts<T extends Wallet>(client: T) {
	if (!client.transport || !client.chain || !client.account) {
		console.log(
			"Ensure client is properly initialized with transport, chain and account",
		);
	}

	return {
		FSManager: getContract({
			client: getKeyedClient(client),
			...definitions.FSManager,
		}),
		FSFileRegistry: getContract({
			client: getKeyedClient(client),
			...definitions.FSFileRegistry,
		}),
		FSKeyRegistry: getContract({
			client: getKeyedClient(client),
			...definitions.FSKeyRegistry,
		}),
	};
}

type Wallet = WalletClient<Transport, Chain, Account>;
