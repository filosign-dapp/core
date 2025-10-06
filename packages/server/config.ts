import { filecoinCalibration } from "viem/chains";

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

const config = {
  INDEXER,
};

export const primaryChain = filecoinCalibration;

export default config;
