import { CID } from "multiformats/cid";
import {
  Account,
  Address,
  Chain,
  encodePacked,
  Hex,
  keccak256,
  parseSignature,
  toHex,
  Transport,
  WalletClient,
} from "viem";

export function parsePieceCid(pieceCid: string) {
  const cid = CID.parse(pieceCid);

  const codecNumeric = cid.code;
  const mh = cid.multihash;
  const multihashCode = mh.code;
  const rawDigest = mh.digest;
  const digestLength = rawDigest.length;

  if (digestLength < 2) throw new Error("digest too short (<2 bytes)");

  const prefix = new Uint8Array(32);
  let digestTail: number;

  if (digestLength <= 34) {
    const prefixLength = Math.min(32, digestLength - 2);
    prefix.set(rawDigest.subarray(0, prefixLength));

    const b1 = rawDigest[digestLength - 2];
    const b2 = rawDigest[digestLength - 1];
    digestTail = (b1 << 8) | b2;
  } else {
    prefix.set(rawDigest.subarray(0, 32));

    const missingByte = rawDigest[32];
    const lastByte = rawDigest[34]; // this is the cactual last byte
    digestTail = (missingByte << 8) | lastByte;
  }

  const pieceCidParity = digestLength > 34;

  const missingByte = digestLength > 34 ? rawDigest[33] : 0;

  return {
    multihashCode,
    codecNumeric,
    digestPrefix: toHex(prefix),
    digestTail,
    digestLength,
    rawDigest,
    pieceCidParity,
    missingByte,
  };
}

export function computeCidIdentifier(pieceCid: string) {
  const { digestPrefix, digestTail } = parsePieceCid(pieceCid);
  return keccak256(
    encodePacked(["bytes32", "uint16"], [digestPrefix, digestTail]),
  );
}

export async function signFileSignature(options: {
  walletClient: WalletClient<Transport, Chain, Account>;
  contractAddress: Address;
  pieceCid: string;
  signatureVisualHash: Hex;
}) {
  const domain = {
    name: "Filosign File Registry",
    version: "1",
    chainId: options.walletClient.chain.id,
    verifyingContract: options.contractAddress,
  };

  const types = {
    Signature: [
      { name: "pieceCidPrefix", type: "bytes32" },
      { name: "pieceCidTail", type: "uint256" },
      { name: "signatureVisualHash", type: "bytes32" },
    ],
  };

  const { digestPrefix: pieceCidPrefix, digestTail: pieceCidTail } =
    parsePieceCid(options.pieceCid);

  const value = {
    pieceCidPrefix: pieceCidPrefix,
    pieceCidTail: pieceCidTail,
    signatureVisualHash: options.signatureVisualHash,
  };

  const flatSig = await options.walletClient.signTypedData({
    types,
    domain,
    message: value,
    primaryType: "Signature",
  });

  const sig = parseSignature(flatSig);
  return {
    v: sig.v,
    r: sig.r,
    s: sig.s,
    flat: flatSig,
  };
}
