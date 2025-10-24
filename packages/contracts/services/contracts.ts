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

export function getContracts<T extends Wallet>(options: {
	client: T;
	chainId: keyof typeof definitions;
}) {
	const { client, chainId } = options;

	if (!client.transport || !client.chain || !client.account) {
		console.log(
			"Ensure client is properly initialized with transport, chain and account",
		);
	}

	const contractDefinitions = definitions[chainId];

	return {
		FSManager: getContract({
			client: getKeyedClient(client),
			...contractDefinitions.FSManager,
		}),
		FSFileRegistry: getContract({
			client: getKeyedClient(client),
			...contractDefinitions.FSFileRegistry,
		}),
		FSKeyRegistry: getContract({
			client: getKeyedClient(client),
			...contractDefinitions.FSKeyRegistry,
		}),
	};
}

export type FilosignContracts = ReturnType<typeof getContracts>;

type Wallet = WalletClient<Transport, Chain, Account>;
