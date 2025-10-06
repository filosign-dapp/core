import type { Address } from "viem";
import type { Defaults } from "../types/client";
import type Logger from "./Logger";
import z from "zod";

export default class ShareCapability {
  private defaults: Defaults;
  private logger: Logger;

  constructor(defaults: Defaults) {
    this.defaults = defaults;
    this.logger = defaults.logger;

    this.logger.info("Posts interface instantiated");
  }

  async sendShareRequest(options: {
    recipientWallet: Address;
    message: string;
    metadata?: Record<string, any>;
  }) {
    const { apiClient } = this.defaults;
    apiClient.ensureJwt();
    const response = await apiClient.rpc.postSafe(
      { id: z.string() },
      "/requests",
      {
        recipientWallet: options.recipientWallet,
        message: options.message,
        metadata: options.metadata,
      },
    );

    return response.data;
  }

  async getReceivedRequests() {
    const { apiClient } = this.defaults;
    apiClient.ensureJwt();
    const response = await apiClient.rpc.getSafe(
      {
        requests: z.array(
          z.object({
            id: z.string(),
            senderWallet: z.string(),
            recipientWallet: z.string(),
            message: z.string().nullable(),
            metadata: z.record(z.string(), z.any()).nullable(),
            status: z.enum([
              "PENDING",
              "ACCEPTED",
              "REJECTED",
              "CANCELLED",
              "EXPIRED",
            ]),
            createdAt: z.number(),
            updatedAt: z.number(),
          }),
        ),
      },
      "/requests/received",
    );

    return response.data;
  }

  async getSentRequests() {
    const { apiClient } = this.defaults;
    console.log("getSentRequests called");
    apiClient.ensureJwt();
    console.log("getSentRequests ensured jwt");
    const response = await apiClient.rpc.getSafe(
      {
        requests: z.array(
          z.object({
            id: z.string(),
            senderWallet: z.string(),
            recipientWallet: z.string(),
            message: z.string().nullable(),
            metadata: z.record(z.string(), z.any()).nullable(),
            status: z.enum([
              "PENDING",
              "ACCEPTED",
              "REJECTED",
              "CANCELLED",
              "EXPIRED",
            ]),
            createdAt: z.number(),
            updatedAt: z.number(),
          }),
        ),
      },
      "/requests/sent",
    );
    console.log("getSentRequests response", response.data);
    return response.data;
  }

  async getPeopleCanSendTo() {
    const { apiClient } = this.defaults;
    apiClient.ensureJwt();
    const response = await apiClient.rpc.getSafe(
      {
        people: z.array(
          z.object({
            walletAddress: z.string(),
            username: z.string().nullable(),
            displayName: z.string().nullable(),
            avatarUrl: z.string().nullable(),
            active: z.boolean(),
            createdAt: z.number(),
          }),
        ),
      },
      "/requests/can-send-to",
    );
    return response.data;
  }

  async getPeopleCanReceiveFrom() {
    const { apiClient } = this.defaults;
    apiClient.ensureJwt();
    const response = await apiClient.rpc.getSafe(
      {
        people: z.array(
          z.object({
            walletAddress: z.string(),
            username: z.string().nullable(),
            displayName: z.string().nullable(),
            avatarUrl: z.string().nullable(),
            active: z.boolean(),
            createdAt: z.number(),
          }),
        ),
      },
      "/requests/can-receive-from",
    );
    return response.data;
  }

  async cancelShareRequest(options: { requestId: string }) {
    const { apiClient } = this.defaults;
    apiClient.ensureJwt();
    const response = await apiClient.rpc.deleteSafe(
      { canceled: z.string() },
      `/requests/${options.requestId}/cancel`,
    );
    return response.data;
  }

  async allowSharing(options: { senderWallet: Address }) {
    const { contracts, tx } = this.defaults;

    const receipt = await tx(
      contracts.FSManager.write.approveSender([options.senderWallet]),
    );
    return receipt;
  }
}
