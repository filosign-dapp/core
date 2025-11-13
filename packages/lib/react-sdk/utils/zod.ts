import { isHex } from "viem";
import z from "zod";

export const zHexString = () =>
	z.string().refine((val) => {
		return isHex(val);
	});
