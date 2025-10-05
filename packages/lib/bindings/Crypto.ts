import { createSharedKey } from "filosign-crypto-utils";
import { type Hex } from "viem";
import { privateKeyToAccount, signMessage } from "viem/accounts";
import { compressPublicKey } from "../utils/crypto";

export class Crypto {
  private _encryptionKey: Uint8Array | null = null;
  private _encryptionPublicKey: Hex | null = null;

  set encryptionKey(key: Uint8Array | null) {
    if (key !== null && (!(key instanceof Uint8Array) || key.length !== 32)) {
      throw new Error("encryptionKey must be Uint8Array(32) or null");
    }
    this._encryptionKey = key;
  }

  set encryptionPublicKey(publicKey: Hex) {
    if (!this._encryptionKey) {
      throw new Error(
        "encryptionKey is not set first before encryptionPublicKey",
      );
    }
    this._encryptionPublicKey = publicKey;
  }

  get encryptionPublicKey() {
    if (!this._encryptionPublicKey) {
      throw new Error(
        "encryptionPublicKey is not set but read attempt as wmade",
      );
    }
    return this._encryptionPublicKey;
  }

  private async deriveRawAesKey(raw: Uint8Array) {
    if (!(raw instanceof Uint8Array) || raw.length !== 32) {
      throw new Error("raw must be Uint8Array(32)");
    }
    return crypto.subtle.importKey(
      "raw",
      raw,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"],
    );
  }

  async encryptWithKey(data: Uint8Array, keyBytes32: Hex) {
    const cryptoKey = await this.deriveRawAesKey(
      Uint8Array.fromHex(keyBytes32.replace("0x", "")),
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      cryptoKey,
      data,
    );

    return { encrypted, iv };
  }

  async encrypt(data: Uint8Array, recipientPubKeyB64: string) {
    if (!this._encryptionKey) {
      throw new Error("Client is not logged in - encryption key is missing");
    }

    const { sharedKey } = createSharedKey(
      this._encryptionKey.toBase64(),
      recipientPubKeyB64,
    );
    const cryptoKey = await this.deriveRawAesKey(
      Uint8Array.fromBase64(sharedKey),
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      cryptoKey,
      data,
    );

    return { encrypted, iv };
  }

  async decrypt(
    encrypted: ArrayBuffer,
    iv: Uint8Array,
    senderPubKeyB64: string,
  ) {
    if (!this._encryptionKey) {
      throw new Error("Client is not logged in - encryption key is missing");
    }

    const { sharedKey } = createSharedKey(
      this._encryptionKey.toBase64(),
      senderPubKeyB64,
    );
    const cryptoKey = await this.deriveRawAesKey(
      Uint8Array.fromBase64(sharedKey),
    );

    return await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      cryptoKey,
      encrypted,
    );
  }

  async signMessage(message: string) {
    if (!this._encryptionKey) {
      throw new Error("Client is not logged in - encryption key is missing");
    }

    const account = privateKeyToAccount(`0x${this._encryptionKey.toHex()}`);
    return await account.signMessage({ message });
  }
}
