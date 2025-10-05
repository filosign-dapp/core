import { p256 } from "@noble/curves/p256";
import { type Hex } from "viem";

export function p256VerifyWithXOnly(
  signature: Hex,
  messageHash: Hex,
  publicKeyX: Hex,
): boolean {
  const sig = p256.Signature.fromCompact(signature.replace("0x", ""));

  for (let recoveryBit = 0; recoveryBit < 2; recoveryBit++) {
    try {
      const sigWithRec = sig.addRecoveryBit(recoveryBit);
      const recoveredPubKey = sigWithRec.recoverPublicKey(
        messageHash.replace("0x", ""),
      );
      const recoveredX = recoveredPubKey.toHex().slice(2, 66);

      if (recoveredX === publicKeyX.replace("0x", "")) {
        return true;
      }
    } catch (e) {
      continue;
    }
  }
  return false;
}
