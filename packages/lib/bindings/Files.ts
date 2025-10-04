import type { Address } from "viem";
import type { Defaults } from "../types/client";
import type Logger from "./Logger";
import z from "zod";
import { calculate as calculatePieceCid } from "@filoz/synapse-sdk/piece";
import { generatePrivateKey } from "viem/accounts";
import { parsePieceCid } from "@filosign/contracts";

const zFileProfile = z.object({
  username: z.string().nullable(),
  displayName: z.string().nullable(),
  avatarUrl: z.string().nullable(),
});

const zFileSignature = z.object({
  id: z.string(),
  signerWallet: z.string(),
  signatureVisualHash: z.string(),
  timestamp: z.number(),
  compactSignature: z.string(),
  onchainTxHash: z.string().nullable(),
  createdAt: z.string(),
  signerProfile: zFileProfile,
});

const zFile = z.object({
  pieceCid: z.string(),
  ownerWallet: z.string(),
  recipientWallet: z.string().nullable(),
  metadata: z.record(z.string(), z.any()).nullable(),
  acknowledged: z.boolean(),
  onchainTxHash: z.string().nullable(),
  acknowledgedTxHash: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  signatures: z.array(zFileSignature),
});

const zSentFile = zFile.extend({
  recipientProfile: zFileProfile,
});

const zReceivedFile = zFile.extend({
  senderProfile: zFileProfile,
});

const zPagination = z.object({
  page: z.number(),
  limit: z.number(),
  hasMore: z.boolean(),
});

export default class Files {
  private defaults: Defaults;
  private logger: Logger;

  constructor(defaults: Defaults) {
    this.defaults = defaults;
    this.logger = defaults.logger;

    this.logger.info("Files interface instantiated");
  }

  async getSentFiles(options?: { page?: number; limit?: number }) {
    const { apiClient } = this.defaults;
    apiClient.ensureJwt();

    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());

    const queryString = params.toString();
    const url = `/files/sent${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.rpc.getSafe(
      {
        files: z.array(zSentFile),
        pagination: zPagination,
      },
      url,
    );
    return response;
  }

  async getReceivedFiles(options?: { page?: number; limit?: number }) {
    const { apiClient } = this.defaults;
    apiClient.ensureJwt();

    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());

    const queryString = params.toString();
    const url = `/files/received${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.rpc.getSafe(
      {
        files: z.array(zReceivedFile),
        pagination: zPagination,
      },
      url,
    );
    return response;
  }

  async uploadFile(options: {
    data: Uint8Array;
    recipientAddress: string;
    metadata?: Record<string, any>;
  }) {
    const { apiClient, crypto, tx, contracts } = this.defaults;
    apiClient.ensureJwt();

    const dataEncryptionKey = generatePrivateKey();

    const { encrypted: encryptedData, iv: dataIv } =
      await crypto.encryptWithKey(options.data, dataEncryptionKey);

    const pieceCid = calculatePieceCid(new Uint8Array(encryptedData));

    const uploadStartResponse = await apiClient.rpc.postSafe(
      {
        uploadUrl: z.string(),
        key: z.string(),
      },
      "/files/upload/start",
      {
        pieceCid: pieceCid,
      },
    );

    const uploadResponse = await fetch(uploadStartResponse.data.uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream",
      },
      body: encryptedData,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed: ${uploadResponse.statusText}`);
    }

    const recipientPubKeyResponse = await apiClient.rpc.getSafe(
      {
        publicKey: z.string(),
      },
      `/user/publickey?address=${options.recipientAddress}`,
    );

    const { encrypted: encryptedKeyBuffer, iv: keyIv } = await crypto.encrypt(
      Uint8Array.fromHex(dataEncryptionKey.replace("0x", "")),
      recipientPubKeyResponse.data.publicKey,
    );

    const encryptedKey = Buffer.from(encryptedKeyBuffer).toString("base64");
    const keyIvBase64 = Buffer.from(keyIv).toString("base64");

    const registerResponse = await apiClient.rpc.postSafe(
      {
        pieceCid: z.string(),
        ownerWallet: z.string(),
        metadata: z.record(z.string(), z.any()).nullable(),
        encryptedKey: z.string().nullable(),
        encryptedKeyIv: z.string().nullable(),
        createdAt: z.string(),
        updatedAt: z.string(),
      },
      "/files",
      {
        pieceCid: pieceCid,
        iv: keyIvBase64,
        encryptedKey: encryptedKey,
        metaData: options.metadata || null,
      },
    );

    const { digestPrefix, digestTail } = parsePieceCid(pieceCid.toString());

    const receipt = await tx(
      contracts.FSFileRegistry.write.registerFile([
        digestPrefix,
        digestTail,
        [options.recipientAddress as Address],
      ]),
    );

    return {
      ...registerResponse,
      onchainTxHash: receipt.transactionHash,
    };
  }

  //   async acknowledgeFile(options: { pieceCid: string }) {
  //     const { contracts, tx } = this.defaults;

  //     const receipt = await tx(
  //       contracts.FSFileRegistry.write.acknowledgeFile([options.pieceCid])
  //     );
  //     return receipt;
  //   }

  //   async signFile(options: {
  //     pieceCid: string;
  //     signatureVisualHash: string;
  //     compactSignature: string;
  //     timestamp: number;
  //   }) {
  //     const { contracts, tx } = this.defaults;

  //     const receipt = await tx(
  //       contracts.FSFileRegistry.write.submitSignature([
  //         options.pieceCid,
  //         options.signatureVisualHash,
  //         options.compactSignature,
  //         options.timestamp,
  //       ])
  //     );
  //     return receipt;
  //   }

  //   async shareFile(options: {
  //     pieceCid: string;
  //     recipientWallet: Address;
  //     encryptedKey: string;
  //     proxyPublicKey: string;
  //     metadata?: Record<string, any>;
  //   }) {
  //     const { contracts, tx } = this.defaults;

  //     const receipt = await tx(
  //       contracts.FSFileRegistry.write.shareFile([
  //         options.pieceCid,
  //         options.recipientWallet,
  //         options.encryptedKey,
  //         options.proxyPublicKey,
  //         JSON.stringify(options.metadata || {}),
  //       ])
  //     );
  //     return receipt;
  //   }
}
