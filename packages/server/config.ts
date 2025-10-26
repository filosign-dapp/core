import type { Chain } from "viem";
import * as chains from "viem/chains";
import env from "./env";

const INDEXER = {
	CONFIRMATIONS: 0n,
	MAX_BATCH_BLOCKS: 200n,
	POLL_INTERVAL_MS: 2_000,
	LOGS_PER_TX: 10,
	DEFAULT_START_BLOCK: 3_081_600n,
	JOB_LOCK_TTL_MS: 30_000,
	DEFAULT_MAX_JOB_ATTEMPTS: 5,
	MAX_NODE_LOOKBACK_PERIOD_MS: 16 * 60 * 60 * 1000,
};

const runtimeChain = Object.values(chains).find(
	(chain) => chain.id === Number(env.RUNTIME_CHAIN_ID),
);

if (!runtimeChain) {
	throw new Error(`Chain with id ${env.RUNTIME_CHAIN_ID} not found`);
}

const config = {
	runtimeChain,
	INDEXER,
};

export default config;
