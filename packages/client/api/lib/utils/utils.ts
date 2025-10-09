import { formatEther } from "viem";

export function generateHash(data: string): string {
	return new Bun.CryptoHasher("sha3-256").update(data).digest("hex");
}

export function formatBalance(
	balance: bigint | undefined,
	decimals: number = 6,
): string {
	if (!balance) return "0";
	return Number(formatEther(balance)).toFixed(decimals);
}
