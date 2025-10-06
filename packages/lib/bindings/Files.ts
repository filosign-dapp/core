import { encodePacked, keccak256, type Address } from "viem";
import type { Defaults } from "../types/client";
import type Logger from "./Logger";
import z from "zod";
import { calculate as calculatePieceCid } from "@filoz/synapse-sdk/piece";
import { generatePrivateKey } from "viem/accounts";
import { parsePieceCid } from "@filosign/contracts";
import { toB64 } from "filosign-crypto-utils";

const zFileProfile = z
  .object({
    username: z.string().nullable(),
    displayName: z.string().nullable(),
    avatarUrl: z.string().nullable(),
  })
  .nullable();

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
  status: z.enum(["s3", "foc", "unpaid_for", "invalid"]),
  recipientWallet: z.string().nullable(),
  metadata: z.record(z.string(), z.any()).nullable(),
  acknowledged: z.boolean(),
  onchainTxHash: z.string().nullable(),
  acknowledgedTxHash: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
  signatures: z.array(zFileSignature),
});

const zSentFile = z.object({
  pieceCid: z.string(),
  ownerWallet: z.string(),
  metadata: z.record(z.string(), z.any()).nullable(),
  status: z.enum(["s3", "foc", "unpaid_for", "invalid"]),
  onchainTxHash: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
  recipients: z.array(
    z.object({
      recipientWallet: z.string(),
      acknowledged: z.boolean(),
      acknowledgedTxHash: z.string().nullable(),
      recipientProfile: zFileProfile,
    }),
  ),
  signatures: z.array(zFileSignature),
});

const zReceivedFile = z.object({
  pieceCid: z.string(),
  ownerWallet: z.string(),
  recipientWallet: z.string().nullable(),
  metadata: z.record(z.string(), z.any()).nullable(),
  status: z.enum(["s3", "foc", "unpaid_for", "invalid"]), // Add this field
  acknowledged: z.boolean(),
  onchainTxHash: z.string().nullable(),
  acknowledgedTxHash: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
  senderProfile: zFileProfile,
  signatures: z.array(zFileSignature),
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
    console.log("🚀 Starting file upload process", {
      dataSize: options.data.length,
      recipientCount: options.recipientAddresses.length,
      recipients: options.recipientAddresses,
      metadata: options.metadata,
    });

    try {
      apiClient.ensureJwt();
      console.log("✅ JWT verified");

      // Generate encryption key
      console.log("🔑 Generating data encryption key...");
      const dataEncryptionKey = generatePrivateKey();
      console.log(
        "✅ Data encryption key generated:",
        dataEncryptionKey.substring(0, 10) + "...",
      );

      // Encrypt data
      console.log("🔒 Encrypting file data...");
      const { encrypted: encryptedData, iv: dataIv } =
        await crypto.encryptWithKey(options.data, dataEncryptionKey);
      console.log("✅ File data encrypted", {
        originalSize: options.data.length,
        encryptedSize: encryptedData.byteLength,
        iv: Buffer.from(dataIv).toString("hex").substring(0, 20) + "...",
      });

      // Calculate piece CID
      console.log("📊 Calculating piece CID...");
      const pieceCid = calculatePieceCid(new Uint8Array(encryptedData));
      console.log("✅ Piece CID calculated:", pieceCid);

      // Get upload URL
      console.log("🌐 Requesting upload URL...");
      const uploadStartResponse = await apiClient.rpc.postSafe(
        {
          uploadUrl: z.string(),
          key: z.string(),
        },
        "/files/upload/start",
        {
          pieceCid: pieceCid.toString(),
        },
      );
      console.log("✅ Upload URL received:", {
        url: uploadStartResponse.data.uploadUrl.substring(0, 50) + "...",
        key: uploadStartResponse.data.key,
      });

      // Upload to S3
      console.log("☁️ Uploading encrypted data to S3...");
      const uploadResponse = await fetch(uploadStartResponse.data.uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/octet-stream",
        },
        body: encryptedData,
      });

      if (!uploadResponse.ok) {
        console.error("❌ S3 upload failed:", {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
        });
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }
      console.log("✅ File uploaded to S3 successfully");

      // Get owner's public key
      const ownerWallet = wallet.account.address;
      console.log("👤 Getting owner public key for wallet:", ownerWallet);
      const ownerPubKeyResponse = await apiClient.rpc.getSafe(
        {
          publicKey: z.string(),
        },
        `/user/public-key?address=${ownerWallet}`,
      );
      console.log(
        "✅ Owner public key retrieved:",
        ownerPubKeyResponse.data.publicKey,
      );

      // Encrypt key for owner
      console.log("🔐 Encrypting data key for owner...");
      const ownerPubKeyHex = ownerPubKeyResponse.data.publicKey;
      const ownerPubKeyB64 = toB64(ownerPubKeyHex);
      console.log("Final base64 public key:", ownerPubKeyB64);

      const { encrypted: ownerEncryptedKeyBuffer, iv: ownerKeyIv } =
        await crypto.encrypt(
          Uint8Array.fromHex(dataEncryptionKey.replace("0x", "")),
          ownerPubKeyB64,
        );

      const ownerEncryptedKey = `0x${Buffer.from(ownerEncryptedKeyBuffer).toString("hex")}`;
      const ownerKeyIvBase64 = `0x${Buffer.from(ownerKeyIv).toString("hex")}`;
      console.log("✅ Owner key encrypted", {
        encryptedKeyLength: ownerEncryptedKey.length,
        ivLength: ownerKeyIvBase64.length,
      });

      // Process recipients
      console.log("👥 Processing recipients...");
      const recipients = [];
      for (let i = 0; i < options.recipientAddresses.length; i++) {
        const recipientAddress = options.recipientAddresses[i];
        console.log(
          `🔄 Processing recipient ${i + 1}/${options.recipientAddresses.length}:`,
          recipientAddress,
        );

        try {
          const recipientPubKeyResponse = await apiClient.rpc.getSafe(
            {
              publicKey: z.string(),
            },
            `/user/public-key?address=${recipientAddress}`,
          );
          console.log(`✅ Recipient ${recipientAddress} public key retrieved`);

          const recipientPubKeyHex = recipientPubKeyResponse.data.publicKey;
          const recipientPubKeyB64 = toB64(recipientPubKeyHex);

          const { encrypted: encryptedKeyBuffer, iv: keyIv } =
            await crypto.encrypt(
              Uint8Array.fromHex(dataEncryptionKey.replace("0x", "")),
              recipientPubKeyB64,
            );

          const encryptedKey = `0x${Buffer.from(encryptedKeyBuffer).toString("hex")}`;
          const keyIvBase64 = `0x${Buffer.from(keyIv).toString("hex")}`;

          recipients.push({
            wallet: recipientAddress,
            encryptedKey,
            iv: keyIvBase64,
          });
          console.log(
            `✅ Recipient ${recipientAddress} key encrypted successfully`,
          );
        } catch (error) {
          console.error(
            `❌ Failed to process recipient ${recipientAddress}:`,
            error,
          );
          throw new Error(
            `Failed to encrypt key for recipient ${recipientAddress}: ${error}`,
          );
        }
      }
      console.log("✅ All recipients processed successfully");

      // Register file in database
      console.log("💾 Registering file in database...");
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
      console.log("✅ File registered in database:", {
        pieceCid: registerResponse.data.pieceCid,
        ownerWallet: registerResponse.data.ownerWallet,
        createdAt: registerResponse.data.createdAt,
      });

      // Register on blockchain
      console.log("⛓️ Registering file on blockchain...");
      const { digestPrefix, digestTail, digestLength, missingByte } =
        parsePieceCid(pieceCid.toString());
      console.log("📝 Parsed piece CID for contract:", {
        digestPrefix: digestPrefix.substring(0, 20) + "...",
        digestTail,
        recipientCount: options.recipientAddresses.length,
      });

      const receipt = await tx(
        contracts.FSFileRegistry.write.registerFile([
          digestPrefix,
          digestTail,
          digestLength - 34 === 0 ? false : true,
          missingByte,
          options.recipientAddresses,
        ]),
      );
      console.log("✅ File registered on blockchain:", {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
      });

      const finalResult = {
        ...registerResponse,
        onchainTxHash: receipt.transactionHash,
      };

      console.log("🎉 File upload completed successfully!", {
        pieceCid: finalResult.data.pieceCid,
        onchainTxHash: finalResult.onchainTxHash,
        totalRecipients: options.recipientAddresses.length,
      });

      return finalResult;
    } catch (error) {
      console.error("💥 File upload failed:", {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        step: "Unknown", // You could track which step failed
        pieceCid: "Not calculated yet",
        recipients: options.recipientAddresses,
      });
      throw error;
    }
  }

  async getFileDetails(options: { pieceCid: string }) {
    const { apiClient } = this.defaults;
    apiClient.ensureJwt();

    const response = await apiClient.rpc.getSafe(
      {
        pieceCid: z.string(),
        ownerWallet: z.string(),
        metadata: z.record(z.string(), z.any()).nullable(),
        status: z.enum(["s3", "foc", "unpaid_for", "invalid"]),
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
      `/user/public-key?address=${fileInfo.ownerWallet}`,
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
