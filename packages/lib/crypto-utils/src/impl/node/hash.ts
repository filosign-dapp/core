import { encodePacked, keccak256 } from "viem";
import {
	ARGON_MEMORY_COST_KIB,
	ARGON_PARALLELISM_DEGREE,
	ARGON_TIMES_COST,
} from "../../constants";

export const hash = keccak256;

export const argon = (...args: Parameters<typeof keccak256>) => {
	const [value, ...rest] = args;
	return keccak256(
		encodePacked(
			["string", "string", "string", "string"],
			[
				value.toString(),
				ARGON_MEMORY_COST_KIB.toString(),
				ARGON_TIMES_COST.toString(),
				ARGON_PARALLELISM_DEGREE.toString(),
			],
		),
		...rest,
	);
};
