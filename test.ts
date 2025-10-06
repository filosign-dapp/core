import { parsePieceCid } from "./packages/contracts/services/utils";
import { rebuildPieceCid } from "./packages/server/lib/utils/multiformats";
import { calculate as computePieceCid } from "@filoz/synapse-sdk/piece";

// const sample = "bafkzcibd4ibakbk6h7qdgm33wzqcdog7j3l72jop7c2ejvvhkkdqxqgqoxfz4mi3"

for (let i = 0; i < 1_000_000; i++) {
  console.log(i);
  const sample = computePieceCid(
    Buffer.from(`this is a test piece cid ${i} 
  ${Bun.randomUUIDv7()}
  ${Bun.randomUUIDv7()}`),
  ).toString();

  const parsed = parsePieceCid(sample);

  const rebuilt = rebuildPieceCid({
    codecNumeric: 85,
    multihashCode: 4113,
    digestPrefix: parsed.digestPrefix,
    digestTail: parsed.digestTail,
    pieceCidParity: parsed.pieceCidParity,
    missingByte: parsed.missingByte,
  });

  if (rebuilt.toString() !== sample) {
    console.log("MISMATCH", {
      parsed,
      rebuilt: rebuilt.toString(),
      expected: sample,
      reconstructionSuccessful: rebuilt.toString() === sample,
      digestLength: parsed.digestLength,
      missingByte: parsed.missingByte,
    });
    throw new Error("CID RECONSTRUCTION MISMATCH");
  }
}
console.log("YAY WORKED!");

// console.log(parsed.digestPrefix.replace("0x", "").length / 2, parsed.digestTail)

// console.log({
//   parsed,
//   rebuilt: rebuilt.toString(),
//   expected: sample,
//   reconstructionSuccessful: rebuilt.toString() === sample,
//   digestLength: parsed.digestLength,
//   missingByte: parsed.missingByte
// })
