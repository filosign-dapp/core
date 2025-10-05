import { p256 } from "@noble/curves/p256";
import { base64 } from "@scure/base";
import { keccak256 } from "viem";

const encKey = "FBb3NTqUwUuPUfvz9eGMs0KbmjpYUwzjV9VW9DeEnAg=";
const encPubKey = "UBANdCqaKraj8tLnFyM39E6yDA6tanhS991uyAI8kto=";

const privateKey = base64.decode(encKey);
const publicKeyPoint = p256.getPublicKey(privateKey, false); // uncompressed
const publicX = publicKeyPoint.slice(1, 33);
const publicXBase64 = base64.encode(publicX);

console.log("Derived x:", publicXBase64);
console.log("Expected x:", encPubKey);

// Sign a message
const msg = "hello world";
const msgHash = keccak256(Uint8Array.from(msg));
const signature = p256.sign(msgHash.replace("0x", ""), privateKey.toHex());

// Add recovery bit (needed for public key recovery)
const signatureWithRecovery = signature.addRecoveryBit(0);

// Verify with full public key (traditional way)
const isValidFull = p256.verify(
  signatureWithRecovery.toCompactHex(),
  msgHash.replace("0x", ""),
  publicKeyPoint.toHex(),
);
console.log("✓ Valid with full public key:", isValidFull);

// Verify with only x-coordinate (your requirement)
function verifyWithXOnly(
  signatureHex: string,
  messageHash: string,
  storedX: string,
): boolean {
  // Parse signature (fromCompact doesn't preserve recovery bit)
  const sig = p256.Signature.fromCompact(signatureHex);

  // Try both possible recovery bits (0 and 1)
  for (let recoveryBit = 0; recoveryBit < 2; recoveryBit++) {
    try {
      const sigWithRec = sig.addRecoveryBit(recoveryBit);
      const recoveredPubKey = sigWithRec.recoverPublicKey(messageHash);
      const recoveredX = recoveredPubKey.toHex().slice(2, 66); // Extract x from compressed key

      // Check if recovered x matches stored x
      if (recoveredX === storedX) {
        return true;
      }
    } catch (e) {
      // Try next recovery bit
    }
  }
  return false;
}

const isValidXOnly = verifyWithXOnly(
  // signatureWithRecovery.toCompactHex(),
  // msgHash.replace("0x", ""),
  // publicX.toHex()
  "24352c52966604dc745519e9ed381ca5a283836cb33d42e1a7727930f65227b34ebe9cafaf2c12555cb9627cc174ba33047d40354b17cf993a54fa5ae573d13d",
  "9aed77df6640b0d02e589275298cd560d92094cacab5e2459d1be49d0a044bca",
  "07a92eee8c160d8c117088cbd4011eeddd55fe45564346ff9b416a24c7caba3a",
);
console.log("✓ Valid with x-only verification:", isValidXOnly);
