import { ripemd160 } from "viem";

export function getRipemd160HashBrowser(data: string): string {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);
  const hashHex = ripemd160(dataBytes);
  return hashHex;
}
