import { type Client, type WalletClient, getContract } from "viem";
import { definitions } from "../definitions";

export function getContracts<T extends Client | WalletClient>(client: T) {
  return {
    FSManager: getContract({ client, ...definitions.FSManager }),
    FSFileRegistry: getContract({ client, ...definitions.FSFileRegistry }),
    FSKeyRegistry: getContract({ client, ...definitions.FSKeyRegistry }),
  };
}
