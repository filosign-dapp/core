import { CID } from "multiformats";
import * as digest from "multiformats/hashes/digest";
import { fromHex, type Hex } from "viem";

export function rebuildPieceCid(options: {
  codecNumeric: number;
  multihashCode: number;
  digestPrefix: Hex;
  digestTail: number;
  pieceCidParity: boolean;
  missingByte?: number;
}): CID {
  const {
    codecNumeric,
    multihashCode,
    digestPrefix,
    digestTail,
    pieceCidParity,
    missingByte = 0,
  } = options;

  const digestLength = pieceCidParity ? 35 : 34;

  if (digestLength < 2)
    throw new Error("digestLength must be at least 2 bytes");

  const prefixBytes = fromHex(digestPrefix, { to: "bytes" });
  const rawDigest = new Uint8Array(digestLength);

  if (digestLength <= 34) {
    const prefixBytesToUse = Math.min(prefixBytes.length, digestLength - 2);
    rawDigest.set(prefixBytes.subarray(0, prefixBytesToUse));

    rawDigest[digestLength - 2] = (digestTail >> 8) & 0xff;
    rawDigest[digestLength - 1] = digestTail & 0xff;
  } else {
    rawDigest.set(prefixBytes.subarray(0, 32));

    const missingByteFromTail = (digestTail >> 8) & 0xff;
    const lastByte = digestTail & 0xff;

    rawDigest[32] = missingByteFromTail;
    rawDigest[33] = missingByte;
    rawDigest[34] = lastByte;
  }

  const mh = digest.create(multihashCode, rawDigest);
  return CID.createV1(codecNumeric, mh);
}
