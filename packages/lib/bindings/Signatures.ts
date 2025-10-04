import type { Defaults } from "../types/client";
import type Logger from "./Logger";
import z from "zod";

const zUserSignature = z.object({
  id: z.string(),
  walletAddress: z.string(),
  storageBucketPath: z.string(),
  visualHash: z.string(),
  name: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export default class Signatures {
  private defaults: Defaults;
  private logger: Logger;

  constructor(defaults: Defaults) {
    this.defaults = defaults;
    this.logger = defaults.logger;

    this.logger.info("Signatures interface instantiated");
  }

  async uploadSignature(options: { file: File; name: string }) {
    const { apiClient } = this.defaults;
    apiClient.ensureJwt();

    const formData = new FormData();
    formData.append("file", options.file);
    formData.append("name", options.name);

    const response = await apiClient.rpc.postSafe(
      { data: zUserSignature },
      "/user/signatures",
      formData,
    );
    return response;
  }

  async getSignatures() {
    const { apiClient } = this.defaults;
    apiClient.ensureJwt();

    const response = await apiClient.rpc.getSafe(
      { signatures: z.array(zUserSignature) },
      "/user/signatures",
    );
    return response;
  }

  async deleteSignature(signatureId: string) {
    const { apiClient } = this.defaults;
    apiClient.ensureJwt();

    const response = await apiClient.rpc.deleteSafe(
      {},
      `/user/signatures/${signatureId}`,
    );
    return response;
  }
}
