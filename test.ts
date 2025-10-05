import { p256 } from "@noble/curves/p256";
import { base64 } from "@scure/base"; // Optional, but helps for encoding/decoding
import { keccak256 } from "viem";

const encKey = "";
const encPubKey = "";

const privateKey = base64.decode(encKey); // returns Uint8Array
const publicKeyPoint = p256.getPublicKey(privateKey, false); // uncompressed
const publicX = publicKeyPoint.slice(1, 33);
const publicXBase64 = base64.encode(publicX);

console.log("Derived:", publicXBase64);
console.log("Expected:", encPubKey);

const msg = "hello world";
const msgHash = keccak256(Uint8Array.from(msg));
const signature = p256.sign(msgHash.replace("0x", ""), privateKey.toHex());
const signatureB64 = base64.encode(signature.toDERRawBytes());

console.log("Signature (base64 DER):", signatureB64);

const isValid = p256.verify(
  signature,
  msgHash.replace("0x", ""),
  publicKeyPoint.toHex(),
);
console.log("Valid?", isValid);
