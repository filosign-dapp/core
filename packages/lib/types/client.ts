import type { getContracts } from "@filosign/contracts";
import type {
	Account,
	Chain,
	PublicClient,
	TransactionReceipt,
	Transport,
	WalletClient,
} from "viem";
import type ApiClient from "../bindings/ApiClient";
import type { Crypto } from "../bindings/Crypto";
import type Logger from "../bindings/Logger";
import type { FilosignStore } from "../store";

export type FilosignClientConfig = {
	debug?: boolean;
	apiBaseUrl: string;
	wallet: Wallet;
};

export type Wallet = WalletClient<Transport, Chain, Account>;

export type Defaults = {
	logger: Logger;
	apiClient: ApiClient;
	contracts: ReturnType<typeof getContracts<Wallet>>;
	publicClient: PublicClient;
	crypto: Crypto;
	wallet: Wallet;
	store: FilosignStore;
	tx: (txnPromise: Promise<`0x${string}`>) => Promise<TransactionReceipt>;

	//   store: FilosignStore;
	//   events: EventNotifier;
};
