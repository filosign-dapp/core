import { encodePacked, keccak256, type Address } from "viem";
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
  createdAt: z.number(),
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
  createdAt: z.number(),
  updatedAt: z.number(),
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
    recipientAddresses: Address[];
    metadata?: Record<string, any>;
  }) {
    const { apiClient, crypto, tx, contracts, wallet } = this.defaults;
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

    const ownerWallet = wallet.account.address;
    const ownerPubKeyResponse = await apiClient.rpc.getSafe(
      {
        publicKey: z.string(),
      },
      `/user/publickey?address=${ownerWallet}`,
    );

    const { encrypted: ownerEncryptedKeyBuffer, iv: ownerKeyIv } =
      await crypto.encrypt(
        Uint8Array.fromHex(dataEncryptionKey.replace("0x", "")),
        ownerPubKeyResponse.data.publicKey,
      );

    const ownerEncryptedKey = Buffer.from(ownerEncryptedKeyBuffer).toString(
      "base64",
    );
    const ownerKeyIvBase64 = Buffer.from(ownerKeyIv).toString("base64");

    const recipients = [];
    for (const recipientAddress of options.recipientAddresses) {
      const recipientPubKeyResponse = await apiClient.rpc.getSafe(
        {
          publicKey: z.string(),
        },
        `/user/publickey?address=${recipientAddress}`,
      );

      const { encrypted: encryptedKeyBuffer, iv: keyIv } = await crypto.encrypt(
        Uint8Array.fromHex(dataEncryptionKey.replace("0x", "")),
        recipientPubKeyResponse.data.publicKey,
      );

      const encryptedKey = Buffer.from(encryptedKeyBuffer).toString("base64");
      const keyIvBase64 = Buffer.from(keyIv).toString("base64");

      recipients.push({
        wallet: recipientAddress,
        encryptedKey,
        iv: keyIvBase64,
      });
    }

    const registerResponse = await apiClient.rpc.postSafe(
      {
        pieceCid: z.string(),
        ownerWallet: z.string(),
        metadata: z.record(z.string(), z.any()).nullable(),
        ownerEncryptedKey: z.string(),
        ownerEncryptedKeyIv: z.string(),
        createdAt: z.number(),
        updatedAt: z.number(),
      },
      "/files",
      {
        pieceCid: pieceCid.toString(),
        recipients,
        metaData: options.metadata || null,
        ownerEncryptedKey,
        ownerEncryptedKeyIv: ownerKeyIvBase64,
      },
    );

    const { digestPrefix, digestTail } = parsePieceCid(pieceCid.toString());

    const receipt = await tx(
      contracts.FSFileRegistry.write.registerFile([
        digestPrefix,
        digestTail,
        options.recipientAddresses,
      ]),
    );

    return {
      ...registerResponse,
      onchainTxHash: receipt.transactionHash,
    };
  }

  async getFileDetails(options: { pieceCid: string }) {
    const { apiClient } = this.defaults;
    apiClient.ensureJwt();

    const response = await apiClient.rpc.getSafe(
      {
        pieceCid: z.string(),
        ownerWallet: z.string(),
        metadata: z.record(z.string(), z.any()).nullable(),
        userRole: z.enum(["owner", "recipient"]),
        userAcknowledged: z.boolean(),
        userAcknowledgedTxHash: z.string().nullable(),
        recipients: z.array(
          z.object({
            recipientWallet: z.string(),
            acknowledged: z.boolean(),
            acknowledgedTxHash: z.string().nullable(),
            acknowledgedAt: z.string().nullable(),
            recipientProfile: zFileProfile,
          }),
        ),
        acknowledgmentSummary: z.object({
          total: z.number(),
          acknowledged: z.number(),
          pending: z.number(),
          allAcknowledged: z.boolean(),
        }),
        signatures: z.array(zFileSignature),
        ownerProfile: zFileProfile,
        onchainTxHash: z.string().nullable(),
        createdAt: z.number(),
        updatedAt: z.number(),
      },
      `/files/${options.pieceCid}`,
    );

    return response.data;
  }

  async acknowledgeFile(options: { pieceCid: string }) {
    const { tx, contracts } = this.defaults;
    const { digestPrefix, digestTail } = parsePieceCid(options.pieceCid);

    const cidIdentifier = keccak256(
      encodePacked(["bytes32", "uint16"], [digestPrefix, digestTail]),
    );

    const receipt = await tx(
      contracts.FSFileRegistry.write.acknowledge([cidIdentifier]),
    );

    return {
      transactionHash: receipt.transactionHash,
      cidIdentifier,
      acknowledged: true,
    };
  }

  async viewFile(options: {
    pieceCid: string;
    encryptedFileData: Uint8Array;
  }): Promise<{
    data: Uint8Array;
    metadata?: Record<string, any>;
  }> {
    const { apiClient, crypto } = this.defaults;
    apiClient.ensureJwt();

    const fileInfo = await this.getFileDetails({ pieceCid: options.pieceCid });

    if (fileInfo.userRole === "recipient" && !fileInfo.userAcknowledged) {
      throw new Error("File must be acknowledged before viewing");
    }

    const keyResponse = await apiClient.rpc.getSafe(
      {
        encryptedKey: z.string(),
        encryptedKeyIv: z.string(),
        role: z.enum(["owner", "recipient"]),
      },
      `/files/${options.pieceCid}/key`,
    );

    const ownerPubKeyResponse = await apiClient.rpc.getSafe(
      {
        publicKey: z.string(),
      },
      `/user/publickey?address=${fileInfo.ownerWallet}`,
    );

    const encryptedKeyHex = keyResponse.data.encryptedKey;
    const encryptedKeyIvHex = keyResponse.data.encryptedKeyIv;

    const encryptedKeyBuffer = Buffer.from(
      encryptedKeyHex.replace("0x", ""),
      "hex",
    );
    const encryptedKeyIvBuffer = Buffer.from(
      encryptedKeyIvHex.replace("0x", ""),
      "hex",
    );

    const decryptedKeyBuffer = await crypto.decrypt(
      encryptedKeyBuffer,
      new Uint8Array(encryptedKeyIvBuffer),
      ownerPubKeyResponse.data.publicKey,
    );

    const decryptedData = await crypto.decryptWithKey(
      options.encryptedFileData,
      `0x${Buffer.from(decryptedKeyBuffer).toString("hex")}`,
    );

    return {
      data: decryptedData,
      metadata: fileInfo.metadata || undefined,
    };
  }
}
