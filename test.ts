import { calculate as computePieceCid } from "@filoz/synapse-sdk/piece";
import { CID } from "multiformats";
import {
	parsePieceCid,
	rebuildPieceCid,
} from "./packages/contracts/services/utils";

// const sample = "bafkzcibd4ibakbk6h7qdgm33wzqcdog7j3l72jop7c2ejvvhkkdqxqgqoxfz4mi3"

for (let i = 0; i < 1000; i++) {
	const buff = Buffer.from(
		crypto.getRandomValues(
			new Uint8Array(200 + Math.floor(Math.random() * 50_000) * 100),
		),
	);

	console.log((buff.length / (1024 * 1024)).toFixed(2) + " MB");

	const sample = computePieceCid(buff).toString();
	const bytes = new TextEncoder().encode(sample);

	const hex = `0x${bytes.toHex()}` as const;

	console.log(hex.length / 2 - 1, `Bytes`, hex);

	const reconstructedString = rebuildPieceCid(parsePieceCid(sample));

	if (reconstructedString !== sample) {
		throw new Error("RECONSTRUCTION MISMATCH");
	}
}

// const rawDigest = CID.parse(sample).multihash.digest;

// console.log("rawDigest length", rawDigest.length);

// viewed.set(rawDigest.length, true);

// const rebuilt = CID.createV1(85, digest.create(4113, rawDigest));

// if (rebuilt.toString() !== sample) {
//   console.log("MISMATCH", {
//     sample,
//     rebuilt: rebuilt.toString(),
//     rawDigest: Buffer.from(rawDigest).toString("hex"),
//   });
//   throw new Error("CID RECONSTRUCTION MISMATCH");
// }

console.log("YAY WORKED!");
