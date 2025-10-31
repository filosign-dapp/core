import { getContracts } from "@filosign/contracts";
import { createWalletClient, http, isHex, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import config from "../config";
import env from "../env";

if (!isHex(env.EVM_PRIVATE_KEY_SERVER)) {
	throw new Error(
		"env error: EVM_PRIVATE_KEY_SERVER is not a valid private key",
	);
}

export const evmClient = createWalletClient({
	chain: config.runtimeChain,
	transport: http(config.runtimeChain.rpcUrls.default.http[0]),
	account: privateKeyToAccount(env.EVM_PRIVATE_KEY_SERVER),
}).extend(publicActions);

export const fsContracts = getContracts({
	//@ts-expect-error
	client: evmClient,
	chainId: evmClient.chain.id,
});
